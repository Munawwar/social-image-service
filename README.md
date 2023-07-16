# Social Image Service

Dynamically generate social media images for web pages, using AWS Lambda (arc), Satori and resvg.

<img src="preview.png" alt="Preview" width="504"/>


# Step 1: Design

```sh
npm ci
npm run preview
```

Start editing JSX and styles at `src/http/get-index/get-open-graph-jsx.js`

# Step 2: Test image generation locally

```sh
npm run dev
# Test end-point
open http://localhost:3333/?title=Queues%20with%20Gmail&tag=YOLO
```

# Step 3: Deploy to AWS

Set AWS credentials named `personal` in `~/.aws/credentials` file.

```
[personal]
aws_access_key_id=<Your AWS Access Key>
aws_secret_access_key=<Your AWS Secret>
```

```sh
npm run deploy
# Once it completes, it will display the deployed service URL
```

Use the following tags in your head tag (after filling the placeholders):
```html
<meta property="og:image" content="{{ your service url }}?title={{ page title }}&tag={{ tags }}">

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="{{ your service url }}?title={{ page title }}&tag={{ tags }}">
```