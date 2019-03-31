
(function($) {

    $.config = {
        url : '', //链接地址
        debug : false
        //日志打印
    };

    $.init = function(config) {
        this.config = config;
        return this;
    };

    /**
     * 连接webcocket
     */
    $.connect = function() {
        var protocol = (window.location.protocol === 'http:') ? 'ws:' : 'wss:';
        this.host = protocol +"//"+this.config.url;
        window.WebSocket = window.WebSocket || window.MozWebSocket;
        if (!window.WebSocket) { // 检测浏览器支持
            this.error('Error: WebSocket is not supported .');
            return;
        }
        this.socket = new WebSocket(this.host); // 创建连接并注册响应函数
        this.socket.onopen = function() {
            $.onopen();
        };
        this.socket.onmessage = function(message) {
            $.onmessage(message);
        };
        this.socket.onclose = function() {
            $.onclose();
            $.socket = null; // 清理
        };
        this.socket.onerror = function(errorMsg) {
            $.onerror(errorMsg);
        };
        return this;
    }

    /**
     * 自定义异常函数
     * @param {Object} errorMsg
     */
    $.error = function(errorMsg) {
        this.onerror(errorMsg);
    }

    /**
     * 消息发送
     */
    $.send = function(message) {
        if (this.socket) {
            this.socket.send(message);
            return true;
        }
        this.error('please connect to the server first !!!');
        return false;
    }

    $.close = function() {
        if (this.socket !== undefined && this.socket != null) {
            this.socket.close();
        } else {
            this.error("this socket is not available");
        }
    }

    /**
     * 消息回调
     * @param {Object} message
     */
    $.onmessage = function(message) {

    }


    /**
     * 关闭回调
     */
    $.onclose = function() {
        this.config.debug && this.log("WebSocket连接关闭");
        heartCheck.heartflag = false;
        if (heartCheck.tryTime < 10) {
            setTimeout(()=>{
                heartCheck.tryTime++;
                console.log(this)
                this.onopen();
            }, 3 * 1000);
        } else {
            this.config.debug && this.log("----------------------");
        }
    };

    /**
     * 异常回调
     */
    $.onerror = function() {
        heartCheck.heartflag = false;
        this.config.debug && this.log("WebSocket连接发生错误");
    };
    /**
     * 向控制台打印日志
     */
    $.log = function(msg) {
        console.log(msg);
    };

    // 监听窗口关闭事件，当窗口关闭时，主动去关闭websocket连接，防止连接还没断开就关闭窗口，server端会抛异常。
    window.onbeforeunload = function() {
        this.ws.close();//关闭
        window.localStorage.clear();//清空本地 存储
    }

})(ws = {});
//心跳检测
var heartCheck = {
    heartflag : false,
    tryTime : 0,
    timeout : 30000,
    timeoutObj : null,
    reset : function() {
        clearTimeout(this.timeoutObj);
        this.start();
    },
    start : function() {
        this.timeoutObj = setTimeout(()=> {
            if (this.heartflag) {
                ws.send("&");
            }
        }, this.timeout)
    },
};