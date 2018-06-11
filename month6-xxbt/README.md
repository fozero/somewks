# template-gulp

> 一个gulp自动化构建工程模板，支持less编译，html、css、js文件及图片压缩，自动添加浏览器前缀，本地开发环境下文件监听浏览器自动刷新

# quickstart
- git clone git@github.com:fozero/template-gulp.git
- cd template-gulp & npm install
- gulp
- 浏览器访问http://localhost:3000/


# 目录结构说明
```
|-dist                  #打包编译输出目录
	|-css               #css文件目录
	|-images 			#images文件目录
	|-js				#js文件目录
    |-index.html        #html静态页面
|-rev          			#manifest文件生成目录，记录资源路径替换版本
    |-css
	|-images
	|-js
|-src                   #源码
	|-css
	|-images
	|-js
	|-less
    |-index.html    
|-gulpfile.js            #gulp任务管理
|-package.json           #项目依赖
```

# 联系我

- 如有问题，欢迎给我提[issues](https://github.com/fozero/template-gulp/issues)
- [https://github.com/fozero](https://github.com/fozero)