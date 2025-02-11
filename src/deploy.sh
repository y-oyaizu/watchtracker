#!/bin/bash

# Step 1: Ensure the destination directory exists
echo "📂 Creating GAS directory..."
mkdir -p gas

# Step 2: Copy JavaScript files to GAS format
echo "🛠 Copying JavaScript files to GAS format..."
for file in *.js; do
  cp "$file" "gas/$(basename "$file" .js).gs"  # Convert .js to .gs
done

echo "✅ File transfer complete. Files are ready for GAS."

# Optional Step: Deploy to Google Apps Script using clasp
if command -v clasp &> /dev/null; then
  echo "🚀 Deploying to Google Apps Script..."
  cd gas
  clasp push
  echo "✅ Deployment complete!"
else
  echo "⚠️ clasp is not installed. Install with: npm install -g @google/clasp"
fi

