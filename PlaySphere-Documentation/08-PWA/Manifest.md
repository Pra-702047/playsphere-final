# Manifest (manifest.json)

The Web App Manifest is a JSON file that tells the browser how PlaySphere should behave when installed on the user's desktop or mobile device.

## Configuration Snapshot
```json
{
  "name": "PlaySphere",
  "short_name": "PlaySphere",
  "description": "Book sports turfs instantly.",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#000000",
  "theme_color": "#84cc16",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```