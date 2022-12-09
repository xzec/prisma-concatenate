# Prisma concatenate

This is a POC script to watch for prisma schema files and concatenate their contents into a single target schema file. 

## Prerequisites
This is a deno project, so you have to have
- `deno` installed,
- Optional: Deno extension for your code editor installed and enabled for this project.

## Run
```shell
deno run --allow-read --allow-write --watch index.ts
```

Copyright @ Juraj Zec 2022