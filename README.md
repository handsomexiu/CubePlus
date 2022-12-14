# Cubeplus

Software function display ：https://handsomexiu.gihub.io/cubeplus/

## Environment Build

Clone this repo and run (require nodejs 16.x)，you can use`node -v`to check your version in your terminal:

```
npm install
npx webpack
```

## Test

```
npm test/npm run test
```

## Run Server

```
npm run dev
```

Then you can visit http://localhost:8080/ for a demo in development mode. You can run server directly without testing, but it is recommended to test it first

## Releases

For prodcution, run

```
npm run build
```

The components will be compiled in `dist` folder in production mode.
