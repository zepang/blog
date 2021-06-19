
---
title: mouseout过滤经过子元素触发
img: 'https://placem.at/places?h=140'
date: '2018-09-16'
---

场景：
在一个元素上监听了一个mouseout的事件，但是当鼠标在这个元素的子元素上移动时，就会触发这个事件。但是我们希望是在这个元素内活动，都是算这个元素的，并不希望触发这个事件。

第一种：

```js
function onMouseOut(this, event) {
   let el = event.toElement || event.relatedTarget;

    // 不断的网上查找父级元素，若能找到与当前事件对象一致则认为el是当前事件对象内子元素，则不触发mouseout逻辑
    while(el && el.parentNode && el.parentNode != window) {
        if (el.parentNode == this||  el == this) {
            if(el.preventDefault) el.preventDefault();
            return false;
        }
        el = el.parentNode;
    }

    // mouseout实际的逻辑
}

document.getElementById('parent').addEventListener('mouseout',onMouseOut,true);
```

第二种：

```js
function onMouseOut(this, event) {
   let el = event.toElement || event.relatedTarget;

    // 通过contains检查事件对象是否包含该元素，避免触发mouseout逻辑
    if (!this.contains(el)) {
        // mouseout实际的逻辑
    }
}

document.getElementById('parent').addEventListener('mouseout',onMouseOut,true);
```