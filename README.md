# OJK Saham Anki Deck

This repository contains an Anki deck generated from educational articles on the OJK (Otoritas Jasa Keuangan) "Sikapi Uangmu" website.

## Content
- **`anki_import.csv`**: The main file to import into Anki. Contains 40+ Q&A pairs about stock market basics, history, and indices.
- **`ojk_raw_materials.md`**: The full raw text of the 12 scraped articles.
- **`extract_qa.py`**: The Python script used to extract the Q&A pairs from the raw text.

## How to Use
1. Download [anki_import.csv](https://github.com/brzaa/ojk-saham-anki/raw/main/anki_import.csv).
2. Open Anki.
3. Select **File** > **Import**.
4. Choose the `anki_import.csv` file.
5. Ensure fields are mapped: Field 1 -> Front, Field 2 -> Back.

## Source
Content sourced from [Sikapi Uangmu - OJK](https://sikapiuangmu.ojk.go.id/).
