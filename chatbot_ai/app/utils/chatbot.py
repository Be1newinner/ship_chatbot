import torch
from datetime import datetime
from beanie import PydanticObjectId
from transformers.pipelines import pipeline
from app.models.chat import ChatHistory
from typing import List , Dict, Any, cast

class ChatService:
    # Handles chatbot interaction, message retrieval, and database storage

    def __init__(self):
        # Initializes the chatbot pipeline with model settings
        self.pipe = pipeline(
            "text-generation",
            model="TinyLlama/TinyLlama-1.1B-Chat-v1.0",
            torch_dtype=torch.bfloat16,
            device_map="auto"
        )

    async def get_past_chats(self, session_id: PydanticObjectId, limit: int = 10):
        # Fetches the last `limit` messages for a given session from DB.
        return await ChatHistory.find(ChatHistory.session_id == str(session_id)).sort(
            "-timestamp"
        ).limit(limit).to_list()

    def clean_response(self, response_text: str):
        # Removes unwanted system, user, and assistant tags from the response
        return response_text.split("<|assistant|>")[-1]

    async def process_message(self, session_id: PydanticObjectId, user_id: PydanticObjectId, msg: str):
        # Handles the full chatbot interaction, including context retrieval & response generation.
        
        past_chats = await self.get_past_chats(session_id)        
        messages = [{"role": "system", "content": "You are a friendly chatbot."}]
        
        # Add past messages for context
        for chat in reversed(past_chats):
            messages.append({"role": "user", "content": chat.message})
            messages.append({"role": "assistant", "content": chat.response})

        # Append the new user message
        messages.append({"role": "user", "content": msg})
        assert self.pipe.tokenizer is not None
        prompt = self.pipe.tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
        raw_outputs = self.pipe(
                                prompt,
                                max_new_tokens=150,
                                do_sample=True,
                                temperature=0.7,
                                top_k=50,
                                top_p=0.95
                            )
        
        outputs: List[Dict[str, Any]] = cast(List[Dict[str, Any]], raw_outputs)

        if not outputs or "generated_text" not in outputs[0]:
            raise ValueError("Model response is missing 'generated_text'")

        raw_response = outputs[0]["generated_text"]
        cleaned_response = self.clean_response(raw_response)

        await ChatHistory(
            session_id=str(session_id),
            user_id=str(user_id),
            message=msg,
            response=cleaned_response,
            timestamp=datetime.utcnow()
        ).insert()

        return {"assistant": cleaned_response}
