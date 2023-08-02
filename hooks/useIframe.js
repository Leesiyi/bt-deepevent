const initIframe = (loadedCallback) => {
    const iframeDom = window.document.createElement('iframe')
    iframeDom.style.display = 'none'
    iframeDom.src = 'http://101.251.197.221:82/upload/scene/scene/24/'
    iframeDom.id = 'sandBox'
    window.document.body.appendChild(iframeDom)
    const sandBox = document.getElementById('sandBox')
    sandBox.onload = () => {
        sandBox.contentWindow.postMessage(
            { body: { funcName: 'getLocalstorages' } },
            '*'
        )
        loadedCallback && loadedCallback()
    }
}
const resetLocalstorgeMethod = () => {
    const isSdk2 = /^http/.test(window.location.href)
    window.localStorage.setItem = (function (oldFunc) {
        console.log('重写本地存储方法——：setItem')
        return function () {
            const contentWindow = document.getElementById('sandBox').contentWindow
            const args = Array.prototype.slice.call(arguments)
            contentWindow.postMessage(
                {
                    body: { funcName: 'setItem', keyName: args[0], setValue: args[1] },
                },
                '*'
            )
            oldFunc.apply(this, arguments)
        }
    })(window.localStorage.setItem)
    window.localStorage.removeItem = (function (oldFunc) {
        return function () {
            console.log('重写本地存储方法——：removeItem')
            const contentWindow = document.getElementById('sandBox').contentWindow
            const args = Array.prototype.slice.call(arguments)
            contentWindow.postMessage(
                { body: { funcName: 'removeItem', keyName: args[0] } },
                '*'
            )
            oldFunc.apply(this, arguments)
            return window.localStorage.removeItem
        }
    })(window.localStorage.removeItem)
}

export const initProxyLocalStorage = (callback) => {
    const isSdk2 = /^http/.test(window.location.href)
    if (!isSdk2) {
        callback()
        return
    } 
    window.addEventListener(
        'message',
        (event) => {
            const { body } = event.data
            if ((body === null || body === void 0 ? void 0 : body.type) === 'proxy-featch-localstorage') {
                const responseData = body.responseData
                responseData.forEach((item) => {
                    const { key, value } = item
                    window.localStorage.setItem(key, value)
                })
            }
            callback && callback()
        },
        false
    )
    initIframe()
    resetLocalstorgeMethod()
    
}

// initProxyLocalStorage();