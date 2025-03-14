# EchoShare

<p align="center">
  <img src="https://i.postimg.cc/G24gq7Gj/just-logo.png" width="200" alt="just-logo">
</p>

一个基于 WebRTC 的在线屏幕共享工具，允许您实时与他人共享屏幕、摄像头和音频。

## 功能特点

- 🖥️ 屏幕共享
- 📹 摄像头共享
- 🎤 音频共享
- 💫 PWA 支持
- 🔒 安全 HTTPS 连接
- 📱 响应式设计

## 快速开始

### 开发环境

```bash
# Install dependencies
npm install
```

```bash
# Start development server
npm run dev
```
### 生产环境

使用 Docker:

```bash
# Build and run with docker-compose
docker-compose up -d
 ```

或传统部署方式:

```bash
# Build for production
npm run build

# Preview production build
npm run preview
 ```

## ## Trae AI
使用了 1 个参考

要在你的 WebRTC 屏幕共享应用中实现弹幕功能，我们需要添加一个弹幕系统。这里是实现方案：

1. 首先，我们需要创建一个弹幕组件：
```vue
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const props = defineProps<{
  container?: string;
}>();

const danmakuContainer = ref<HTMLDivElement | null>(null);
const danmakuList = ref<Array<{ id: number; text: string; color: string; }>>([]);
let danmakuId = 0;

// 发送弹幕的方法
const sendDanmaku = (text: string, color = '#ffffff') => {
  const id = danmakuId++;
  danmakuList.value.push({ id, text, color });
  
  // 创建弹幕元素
  const danmaku = document.createElement('div');
  danmaku.innerText = text;
  danmaku.className = 'danmaku-item';
  danmaku.style.color = color;
  
  // 随机高度
  const top = Math.floor(Math.random() * 80) + 10;
  danmaku.style.top = `${top}%`;
  
  // 添加到容器
  if (danmakuContainer.value) {
    danmakuContainer.value.appendChild(danmaku);
    
    // 动画结束后移除
    setTimeout(() => {
      danmaku.remove();
      danmakuList.value = danmakuList.value.filter(item => item.id !== id);
    }, 8000);
  }
};

// 暴露方法给父组件
defineExpose({
  sendDanmaku
});

onMounted(() => {
  // 如果指定了容器，则使用指定的容器
  if (props.container) {
    danmakuContainer.value = document.querySelector(props.container) as HTMLDivElement;
  }
});
</script>

<template>
  <div ref="danmakuContainer" class="danmaku-container" v-if="!props.container"></div>
</template>

<style scoped>
.danmaku-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
  z-index: 100;
}

.danmaku-item {
  position: absolute;
  white-space: nowrap;
  font-size: 20px;
  color: white;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
  animation: danmaku-move 8s linear;
  will-change: transform;
  pointer-events: none;
}

@keyframes danmaku-move {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(-100%);
  }
}
</style>
 ```
```

2. 然后，在接收视频的页面中使用这个组件：
```vue
// ... existing code ...
<template>
    <div>
        // ... existing code ...
        <Teleport to="body" :disabled="!videoIsFitscreen">
            <div class="relative">
                <video
                    v-show="isFindStream"
                    class="w-5/6 m-auto shadow-md"
                    :class="{ 'video-fit-screen': videoIsFitscreen }"
                    ref="screenVideo"
                    autoplay
                    controls
                ></video>
                <Danmaku ref="danmakuRef" :container="videoIsFitscreen ? 'body' : null" />
                <VaButton
                    v-show="isFindStream && width > 768"
                    round
                    class="ml-3 absolute opacity-20 hover:opacity-100 top-[0.5em]"
                    :style="{
                        right: videoIsFitscreen
                            ? '0.5em'
                            : 'calc(8.33333% + 0.5em)',
                    }"
                    @click="videoFitscreen"
                    icon="fit_screen"
                />
                <div v-show="isFindStream" class="danmaku-control">
                    <VaInput v-model="danmakuText" placeholder="输入弹幕内容..." />
                    <VaButton @click="sendDanmaku" icon="send" />
                </div>
            </div>
        </Teleport>
    </div>
</template>
 ```
```

3. 在 script 部分添加相关逻辑：
```typescript
// 在 import 部分添加
import Danmaku from '../../components/Danmaku.vue';

// 在 setup 部分添加
const danmakuRef = ref(null);
const danmakuText = ref('');

function sendDanmaku() {
    if (danmakuText.value.trim()) {
        danmakuRef.value?.sendDanmaku(danmakuText.value);
        danmakuText.value = '';
    }
}
 ```
```

4. 添加样式：
```css
<style scoped>
// ... existing styles ...

.danmaku-control {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 10px;
    width: 80%;
    max-width: 500px;
    z-index: 101;
    background: rgba(0, 0, 0, 0.5);
    padding: 10px;
    border-radius: 8px;
}
</style>
 ```

5. 如果你想在共享端和接收端之间同步弹幕，需要通过数据通道传输：
```typescript
// 添加数据通道支持
export function createPeerInstanceByMode() {
    // ... existing code ...
    
    // 添加数据通道支持
    const peer = new Peer(undefined, peerOptions);
    
    // 创建数据通道处理
    peer.on('connection', (conn) => {
        conn.on('data', (data) => {
            // 处理接收到的弹幕数据
            if (data.type === 'danmaku') {
                // 发布弹幕事件
                window.dispatchEvent(new CustomEvent('danmaku', { 
                    detail: data.content 
                }));
            }
        });
    });
    
    return peer;
}
 ```
```

这样就实现了基本的弹幕功能。你还需要在接收端监听这个事件并显示弹幕。如果需要更复杂的功能，比如弹幕颜色选择、大小调整等，可以进一步扩展这个组件。

## shawroger
复制

删除

帮我写一个中文README_CN.md 和 README.md 内容一样，翻译即可

## Trae AI
使用了 1 个参考

receiveScreen.vue 349-349

我来帮你创建一个中文版的 README_CN.md 文件，内容与 README.md 相同，只是翻译成中文：

```markdown
# EchoShare

<p align="center">
  <img src="https://i.postimg.cc/G24gq7Gj/just-logo.png" width="200" alt="just-logo">
</p>

一个基于 WebRTC 的在线屏幕共享工具，允许您实时与他人共享屏幕、摄像头和音频。

## 功能特点

- 🖥️ 屏幕共享
- 📹 摄像头共享
- 🎤 音频共享
- 💫 PWA 支持
- 🔒 安全 HTTPS 连接
- 📱 响应式设计

## 快速开始

### 开发环境

```bash
# 安装依赖
npm install
 ```
```

```bash
# 启动开发服务器
npm run dev
 ```

### 生产环境
使用 Docker:

```bash
# 使用 docker-compose 构建并运行
docker-compose up -d
 ```

或传统部署方式:

```bash
# 构建生产版本
npm run build

# 预览生产构建
npm run preview
 ```

## 技术栈
- Vue 3
- TypeScript
- Vite
- WebRTC
- Vuestic UI
- Tailwind CSS

## 浏览器支持
- Chrome (recommended)
- Firefox
- Edge
- Safari

## 许可证
MIT License
