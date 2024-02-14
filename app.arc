@app
social-image

@http
get /

@aws
profile personal
region eu-west-1
runtime nodejs20.x
architecture x86_64
memory 1152
# Set max concurrency limit to prevent bot abuse
concurrency 3
