from pathlib import Path
import sys, json
root = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(root / '.preview' / 'python-packages'))
import pymupdf
sources = {
    'shopping': root / 'dist/assets/reports/customer-shopping-behavior.pdf',
    'churn': root / 'dist/assets/reports/customer-churn-analytics.pdf',
    'credit': root / 'dist/assets/reports/vehicle-loan-credit-risk.pdf',
    'resume': root / 'dist/assets/Swayam-Dalal-Resume.pdf'
}
out = root / '.preview/references'
for name, filename in sources.items():
    doc = pymupdf.open(filename)
    print(name, 'pages:', len(doc))
    if name == 'resume':
        print('Resume links:', json.dumps([l.get('uri') for p in doc for l in p.get_links() if l.get('uri')]))
    else:
        page_numbers = range(len(doc)) if name == 'shopping' else [10]
        for number in page_numbers:
            page = doc[number]
            page.get_pixmap(matrix=pymupdf.Matrix(1.25, 1.25)).save(str(out / f'{name}-page-{number+1}.png'))
            if name != 'shopping' or number == len(doc)-1:
                for idx, image in enumerate(page.get_images(full=True)):
                    xref = image[0]
                    result = doc.extract_image(xref)
                    if result['width'] > 600 and result['height'] > 250:
                        dest = root / f'dist/assets/{name}-dashboard-{idx}.{result["ext"]}'
                        dest.write_bytes(result['image'])
                        print('Dashboard:', dest.name, result['width'], result['height'])
