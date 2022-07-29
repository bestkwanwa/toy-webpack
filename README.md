# 📦 Toy Webpack

## Usage

### Install
Using pnpm:
```sh
pnpm i
```

### Build
```sh
pnpm run build
```

### Start
```sh
pnpm run start
```
then visit http://localhost:8080

**`npm` and `yarn` are similar.**

## Others

TODO:
- 循环引用
- 重复引用，即一个引用只有一个id
- esm改为cjs

Feature:
- 读文件
- 生成依赖关系
- esm -> cjs
- loader处理非js
    - jason loader
- plugin
    - change output file name
    - html plugin

NOTE:
- sourceCode是esm标准的，而生成的bundle中的模块在引入其他模块时，不能使用esm标准，因为import语句只能在作用域顶层使用，所以需要改成cjs标准，然后实现require函数。
- loader是用来处理非js的文件的。
- plugin更为强大，通过tapable生成plugin的hooks对在不同阶段对文件进行处理。

## Tapable
[Tapable 的使用与原理解析](https://zhuanlan.zhihu.com/p/100974318)
