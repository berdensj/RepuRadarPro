#!/bin/bash

# List of pages to update
PAGES=(
  "client/src/pages/responses-page.tsx"
  "client/src/pages/competitors-page.tsx"
  "client/src/pages/reports-page.tsx"
  "client/src/pages/communications-page.tsx"
  "client/src/pages/import-export-page.tsx"
  "client/src/pages/workflows-page.tsx"
  "client/src/pages/activity-logs-page.tsx"
  "client/src/pages/dashboard-builder-page.tsx"
  "client/src/pages/white-label-page.tsx"
  "client/src/pages/templates-page.tsx"
  "client/src/pages/api-access-page.tsx"
  "client/src/pages/settings-page.tsx"
  "client/src/pages/analytics-page.tsx"
)

for page in "${PAGES[@]}"; do
  echo "Updating $page..."
  
  # Add DashboardLayout import if it doesn't exist
  if ! grep -q "import DashboardLayout from" "$page"; then
    sed -i '1s/^/import DashboardLayout from "@\/components\/dashboard\/layout";\n/' "$page"
  fi
  
  # Replace the Sidebar and container div with DashboardLayout
  sed -i 's/import { Sidebar } from "@\/components\/dashboard\/sidebar";//' "$page"
  sed -i 's/<div className="min-h-screen flex flex-col lg:flex-row">\s*<Sidebar \/>/<DashboardLayout>/' "$page"
  sed -i 's/<\/main>\s*<\/div>/<\/main>\n      <\/DashboardLayout>/' "$page"
  
  # Remove useIsMobile hook if it exists
  sed -i '/import { useIsMobile } from "@\/hooks\/use-mobile";/d' "$page"
  sed -i '/const isMobile = useIsMobile();/d' "$page"
done

echo "All pages updated!"
