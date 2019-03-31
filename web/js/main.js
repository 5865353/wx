let left_arrow = new Vue({
    el: "#left-arrow",
    data: {
        name: "",
        tx: "",
        friendli: [
            {
                date: "21:10",
                tx: "img/kk.jpg",
                name: "bj",
                msg: "test"
            }
        ],
    },
    created() {
        this.createName();
        this.createTx(this.name);
    },
    methods: {
        createName() {
            let name = prompt("请输入name", "");
            !name && this.createName();
            this.name = name;
        },
        createTx(name) {
            let color = '#' + Math.random().toString(16).substr(2, 6);
            let c = document.querySelector("#canvas");
            let ctx = c.getContext("2d");
            // 设置对象起始点和终点
            ctx.moveTo(0, 0);
            ctx.lineTo(40, 40);
            // 设置样式
            ctx.lineWidth = 60;
            ctx.strokeStyle = color;
            // 绘制
            ctx.stroke();
            ctx.font = '25px Arial';
            ctx.fillStyle = '#FFFFFF';
            ctx.fillText(name, 0, 26, 40);
            this.tx = canvas.toDataURL("image/png");
        },
        //好友上线
        inconnection(msg) {
            //这是一个数组因为不知道有几个好友在线
            for (let i in msg) {
                //遍历调用
                this.isExitFriend(msg[i]);
            }
        },
        //判断好友是否在列表中
        isExitFriend(msg) {
            let result = this.findFriendByid(msg.sid);
            //存在好友列表 //修改信息 必须这样设置 不然不会出发视图更新
            if (result != undefined) return this.updateValueByIndex(result.index, msg);
            // 不存在添加到好友列表中
            this.friendli.unshift(msg);
        },
        //根据id查询 索引 --值
        findFriendByid(sid) {
            let value = this.friendli.find(function (value) {
                return value.sid == sid;
            });
            if (value != undefined) {
                let index = this.friendli.indexOf(value);
                return obj = {
                    index,
                    value
                };
            }
            return value;
        },
        //点击展示聊天窗口
        chatWindow(index, item) {
            this.topByIndex(index);
            //传值到 右边视图
            right_arrow.updateWindowInfo(item);
        },
        //将某一列置顶
        topByIndex(inedx) {
            //将位置置顶
            this.friendli.unshift(this.friendli[index]);
            this.friendli.splice(index + 1, 1);
        },
        //修改某个索引的值
        updateValueByIndex(index, msg) {
            this.$set(this.friendli, index, msg)
        }

    }
});

let right_arrow = new Vue({
    el: "#right-arrow",
    data: {
        sid: "",
        name: "roco",
        tx: "asdas",
        inputValue: "",
        chatRecord: []
    },
    methods: {
        updateWindowInfo(item) {
            this.name = item.name;
            this.tx = item.tx;
            this.sid = item.sid;
            //遍历聊天记录
            let info = window.localStorage.getItem(item.sid);
            if (info == undefined) return;
            info = info.split("&&");
            var infoArray = [];
            for (let i in info) {
                let code = info[i].indexOf("he") != -1 ? "he" : "me";
                let msg = info[i].split(":")[1];
                let tx = code == "he" ? this.msg.tx : left_arrow.tx;
                infoArray.push({tx, code, msg});
            }
            this.chatRecord = infoArray;
        },
        //保存消息
        saveMsg(sid, code, value) {
            //保存消息到本地
            let seinfo = window.localStorage.getItem(sid); //获取聊天记录
            //判断是否是第一次发送（接受）消息
            value = seinfo == null ? code + ":" + value : seinfo + "&&" + code + ":" + value;
            window.localStorage.setItem(sid, value); //保存  key value
        },
        //发送消息
        sendMsg() {
            let info = {
                tx: right_arrow.tx,
                code: "me",
                msg: this.inputValue
            };
            ws.send(this.sid + "-" + info.msg);
            //保存消息到本地
            this.saveMsg(this.sid, info.code, info.msg);
            this.chatRecord.push(info);
            //清空输入框信息
            this.inputValue = "";
            //

        },
        //收到好友发来的消息
        inmessage(msg) {
            //保存消息
            this.saveMsg(msg.sid, "he", msg.msg);
            //将好友位置置顶 并修改信息
            let result = left_arrow.findFriendByid(msg.sid);
            if (result !== undefined) {
                left_arrow.topByindex(result.index);
                left_arrow.updateValueByIndex(result.index, msg);
            }
            //正在跟当前好友聊天
            if (msg.sid === this.sid) {
                //填充消息到容器
                this.name = msg.name;
                this.tx = msg.tx;
                this.chatRecord.push(msg.msg);
            }

        }
    },
    watch: {
        //监听值
        inputValue(val) {
        }
    }
});


ws.init({
    url: "localhost:8080/wx/websocket", // 后台接口地址
    debug: true //打印日志
}).connect(); //连接

ws.onopen = function () {
    this.send("name-" + left_arrow.name + "&9527&" + left_arrow.tx);
    heartCheck.heartflag = true;
    heartCheck.tryTime = 0;
    heartCheck.start();//检测心跳
    this.config.debug && this.log("连接成功");
};

ws.onmessage = function (message) {
    heartCheck.reset();//检测心跳
    let data = message.data;
    if (data === "&") {
        this.config.debug && this.log("心跳");
        return;
        //遍历消息
    }
    let json_msg = JSON.parse(data);
    console.log(json_msg);
    if (json_msg instanceof Array) return left_arrow.inconnection(json_msg); //好友上线
    let code = json_msg.code; //获取状态
    right_arrow[code](json_msg); //调用方法
    // code --connection==好友上线	// --inerror ==好友下线 --inmessage 好友消息
};
