TODO:
- 循环引用
- 重复引用，即一个引用只有一个id
- 升级babel
- esm改为cjs

Feature:
- 读文件
- 生成依赖关系
- esm -> cjs
- loader处理非js
- plugin

NOTE:
- sourceCode是esm标准的，而生成的bundle中的模块在引入其他模块时，不能使用esm标准，因为import语句只能在作用域顶层使用，所以需要改成cjs标准，然后实现require函数
