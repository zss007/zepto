Zepto.js documentation site
===========================

Site is built with Jekyll, where each Zepto method is a Jekyll "post". They each
render to individual files, but the files don't matter since the docs are all
compiled into one page (`index.html`).

Jekyll categories correspond to Zepto modules, e.g. "ajax", "event".

The site can be built with:

~~~ sh
# 从 zepto 的 gh-pages 分支 clone 的代码，主要对 zepto.js 源码解读时进行了注解
$ script/bootstrap
$ bin/jekyll build
$ open public/index.html
~~~
