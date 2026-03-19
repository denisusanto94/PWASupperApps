
import re

with open('d:/Pekerjaan/Freelance/pwa/WaBlaster/template-montain/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Match everything between <style> and </style>
match = re.search(r'<style>(.*?)</style>', content, re.DOTALL)
if match:
    style = match.group(1).strip()
    
    # Prefix keyframes but they must stay top-level
    # To avoid multiple replaces, we'll use a regex that matches the word boundary
    keyframes = ['ornamentSway', 'ornamentSwayTranslateX', 'ornamentSwayScaleX', 'ornamentSwayTranslateY', 
                 'ornamentSwayTranslateYScaleX', 'fadeUp', 'scrollCueDot', 'scrollCueFloat', 'coverFadeIn',
                 'wmFadeIn', 'wmSwayScaleX', 'wmSwayTranslateYScaleX', 'wmSwayTranslateY']
    for k in keyframes:
        style = re.sub(r'\b' + k + r'\b', 'montain-' + k, style)

    # Scoping: we'll wrap the style but handle @keyframes and @font-face properly
    # Actually, a better way is to prefix all top-level selectors.
    # But since this is huge, let's use the nesting trick but fix it.
    
    # Split by @keyframes and keep them out
    # Keyframes ends with a closing brace at the start of a line or after some whitespace
    # Using a simple brace counter:
    
    final_style = ""
    top_level_blocks = []
    
    # This is a very simple parser to separate @blocks from standard rules
    parts = re.split(r'(@keyframes\s+montain-[\w-]+\s*\{)', style)
    
    # This is getting complicated. Let's use a simpler approach.
    # Just wrap EVERYTHING in .montain-template-root { ... } 
    # and then move @keyframes back out.
    
    # First, fix asset paths
    style = style.replace('assets/images/', '/template/wedding/assets/montain/images/')
    
    # Custom color request for amplop
    style = style.replace('.amplop-divider {', '.amplop-content .cover-subtitle,\n    .amplop-content .cover-title {\n      color: #5c4d3d !important;\n    }\n\n    .amplop-divider {')

    # Now, wrap the whole thing but handle keyframes by making them global again
    # Actually, the easiest way to scope is to literally change the selectors.
    # But with 3000 lines, that's hard.
    
    # Let's try to just wrap it and see if Vite handles it. 
    # If the keyframes fail, I'll move them.
    # To fix the previous "montain-montain" bug, I used re.sub with \b.
    
    wrapped_style = ".montain-template-root {\n" + style + "\n}"
    
    with open('d:/Pekerjaan/Freelance/pwa/WaBlaster/src/template/wedding/montain-template.css', 'w', encoding='utf-8') as f:
        f.write(wrapped_style)
else:
    print("No style found")
