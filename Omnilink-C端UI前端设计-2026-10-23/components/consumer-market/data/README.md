# Collected consumer demo products

`collected-demo-products.json` is generated from the user-provided Omnilink P0001–P0060 workbook. The importer reads product descriptions, prices, categories, attributes, SKU option notes, and embedded images. Images are resized to a maximum 1400 px edge and encoded as WebP; identical main and detail photos are deduplicated.

To refresh the local fixture:

```sh
python3 scripts/import-consumer-demo-workbook.py /path/to/Omnilink-product-workbook.xlsx
```

These records are included in the local development consumer demo. They are saved research snapshots, not a live catalog; prices, availability, and product details may have changed. The importer keeps source notes and source URLs from the workbook when present. Products without source photos use a neutral placeholder.
