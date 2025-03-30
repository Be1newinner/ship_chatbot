import re

def parse_chat_response(raw_text: str):
    """
    Cleans and extracts only the assistant-generated response.
    """
    # Remove system prompt & unnecessary markers
    raw_text = re.sub(r"<\|system\|>.*?</s>", "", raw_text, flags=re.DOTALL).strip()
    raw_text = re.sub(r"<\|user\|>.*?</s>", "", raw_text, flags=re.DOTALL).strip()

    # Extract assistant's response only
    parts = re.split(r"<\|assistant\|>", raw_text)
    if len(parts) > 1:
        assistant_response = parts[-1].strip()
    else:
        assistant_response = raw_text.strip()

    return {"assistant": assistant_response}

