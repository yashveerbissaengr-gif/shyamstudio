import re

with open("src/pages/BillGenerator.tsx", "r") as f:
    content = f.read()

old_div = """<div style={{ background: '#064e3b', color: '#fff', textAlign: 'center', padding: '6px', fontSize: '18px', fontWeight: 'bold', marginTop: '16px', letterSpacing: '0.02em', borderRadius: '4px' }}>"""
new_div = """<div style={{ background: '#064e3b', color: '#fff', textAlign: 'center', padding: '12px 20px', fontSize: '24px', fontWeight: '900', marginTop: '24px', letterSpacing: '0.05em', borderRadius: '8px', textTransform: 'uppercase', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>"""

content = content.replace(old_div, new_div)
content = content.replace('events”', 'events"')

with open("src/pages/BillGenerator.tsx", "w") as f:
    f.write(content)


with open("src/pages/InvoiceGenerator.tsx", "r") as f:
    inv = f.read()

inv = inv.replace(old_div, new_div)
inv = inv.replace('events”', 'events"')

with open("src/pages/InvoiceGenerator.tsx", "w") as f:
    f.write(inv)

print("Fixed footer line")
