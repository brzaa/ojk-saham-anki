import re
import csv
import sys

def parse_articles(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Split by article headers
    raw_articles = re.split(r'# Article \d+:', content)
    articles = []
    
    for raw in raw_articles:
        if not raw.strip():
            continue
            
        lines = raw.strip().split('\n')
        title_line = lines[0].strip()
        
        # Extract URL
        url = ""
        body_start_idx = 1
        for i, line in enumerate(lines):
            if line.startswith("URL:"):
                url = line.replace("URL:", "").strip()
                body_start_idx = i + 1
                break
        
        body = "\n".join(lines[body_start_idx:]).strip()
        articles.append({
            'title': title_line,
            'url': url,
            'body': body
        })
    return articles

def generate_qa_pairs(article):
    qa_pairs = []
    title = article['title']
    body = article['body']
    url = article['url']
    
    # Generic prompt template for LLM (simulated here with heuristic extraction for now, 
    # but in a real scenario we'd call an LLM. Since I am the LLM, I will write the logic 
    # to "simulate" intelligent extraction or prepare the data for me to process manually/interactively).
    
    # HEURISTIC EXTRACTION STRATEGY:
    # 1. Look for headings or questions in the text (often end with ?)
    # 2. Look for definitions (keyword + "adalah" / "merupakan")
    # 3. Look for lists (numbered or bulleted)
    
    lines = body.split('\n')
    current_section = "General"
    buffer = []
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        # Detect headings (heuristic: short lines, often capitalized)
        if len(line) < 60 and (line.isupper() or line.endswith('?')):
            if buffer:
                # Process buffer for previous section
                text_block = " ".join(buffer)
                qa_pairs.extend(extract_from_block(text_block, current_section, title, url))
                buffer = []
            current_section = line
        else:
            buffer.append(line)
            
    if buffer:
        text_block = " ".join(buffer)
        qa_pairs.extend(extract_from_block(text_block, current_section, title, url))
        
    return qa_pairs

def extract_from_block(text, section_header, article_title, url):
    pairs = []
    
    # Basic logic to create "Cloze" or "Basic" card types from sentences
    # Pattern: "X adalah Y" -> Q: Apa itu X? A: Y
    
    # Regex for definitions
    def_pattern = re.compile(r'([^.?!]+)\s+(adalah|merupakan)\s+([^.?!]+)[.?!]')
    matches = def_pattern.findall(text)
    
    for match in matches:
        term = match[0].strip()
        connector = match[1]
        definition = match[2].strip()
        
        # Filter out overly long terms (likely not simple definitions)
        if len(term) > 50: 
            continue
            
        question = f"Apa yang dimaksud dengan **{term}**?"
        answer = f"{term} {connector} {definition}."
        pairs.append((question, answer, article_title, url))
        
    return pairs

def main():
    input_file = '/Users/bram/.gemini/antigravity/brain/e6210ef1-ec49-40c2-91f8-0f223dec3a28/ojk_raw_materials.md'
    output_file = '/Users/bram/.gemini/antigravity/brain/e6210ef1-ec49-40c2-91f8-0f223dec3a28/anki_import.csv'
    
    articles = parse_articles(input_file)
    all_qa = []
    
    print(f"Found {len(articles)} articles.")
    
    for art in articles:
        pairs = generate_qa_pairs(art)
        all_qa.extend(pairs)
        
    print(f"Extracted {len(all_qa)} potential Q&A pairs via heuristics.")
    
    # Write to CSV
    with open(output_file, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(['Question', 'Answer', 'Source_Article', 'Source_URL'])
        writer.writerows(all_qa)
        
    print(f"Written to {output_file}")

if __name__ == "__main__":
    main()
