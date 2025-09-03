mkdir direct-ableton-automation && cd $_
npm init -y
npm i zod
npm i -D typescript ts-node @types/node
npx tsc --init --rootDir src --outDir dist --esModuleInterop true --resolveJsonModule true --module commonjs --target ES2020
