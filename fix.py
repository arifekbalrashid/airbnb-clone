import os
import re

files = [
    "frontend/components/ListingCard.tsx",
    "frontend/app/trips/page.tsx",
    "frontend/app/listing/[id]/page.tsx",
    "frontend/app/confirmation/[bookingId]/page.tsx",
    "frontend/app/checkout/[bookingId]/page.tsx",
    "frontend/app/host/page.tsx",
    "frontend/app/host/listings/page.tsx",
    "frontend/app/host/bookings/page.tsx",
]

for file in files:
    if not os.path.exists(file):
        continue
    with open(file, 'r') as f:
        content = f.read()

    # The broken syntax looks like:
    # export default function SomeComponent({
    #   const { formatPrice } = useCurrency(); props... }: Props) {
    # 
    # Or:
    # export default function SomeComponent({
    #   const { formatPrice } = useCurrency(); 
    
    # We want to replace it by moving the hook declaration inside the function body.
    # We can just remove the wrongly inserted hook declaration first.
    content = content.replace("  const { formatPrice } = useCurrency(); ", "")
    content = content.replace("  const { formatPrice } = useCurrency();\n", "")
    content = content.replace("  const { formatPrice } = useCurrency();", "")

    # Now let's do a better insertion. We can look for `) {\n` or `) {\r\n` after `export default function`.
    # Using a simple approach: find the first `{` that matches the function body opening and insert after it.
    
    # But an easier way with regex:
    # Match `export default function [^(]+\([^)]*\)\s*(?::\s*[^{]+)?\s*\{`
    # and append `\n  const { formatPrice } = useCurrency();`
    
    def replacer(match):
        return match.group(0) + "\n  const { formatPrice } = useCurrency();"
        
    content = re.sub(r'export default function [a-zA-Z0-9_]+\s*\([^)]*\)\s*(?::\s*[^{]+)?\s*\{', replacer, content)

    with open(file, 'w') as f:
        f.write(content)

print("Done")
