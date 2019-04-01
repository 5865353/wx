function FormatTime(t,date){
    var o = {
        "M+" : date.getMonth()+1,                 //月份
        "d+" : date.getDate(),                    //日
        "h+" : date.getHours(),                   //小时
        "m+" : date.getMinutes(),                 //分
        "s+" : date.getSeconds(),                 //秒
        "q+" : Math.floor((date.getMonth()+3)/3), //季度
        "S"  : date.getMilliseconds()             //毫秒
    };
    if(/(y+)/.test(t)){
        t=t.replace(RegExp.$1,(date.getFullYear()+"").substr(4-RegExp.$1.length));
    };
    for(var k in o){
        if(new RegExp("("+ k +")").test(t)){
            t=t.replace(RegExp.$1,(RegExp.$1.length==1)?(o[k]):(("00"+ o[k]).substr((""+o[k]).length)));
        };
    }
    return t;
};



let left_arrow = new Vue({
    el: "#left-arrow",
    data: {
        name: "",
        tx: "",
        friendli: [
            {
                date: "21:10",
                tx: "img/kk.jpg",
                name: "测试",
                msg: "test",
                infoNum:5
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
            msg.infoNum=1;
            let result = this.findFriendByid(msg.sid);
            //存在好友列表 //修改信息 必须这样设置 不然不会出发视图更新
            if (result != undefined) {
                let num=result.value.infoNum;
                msg.infoNum=num++;
                this.updateValueByIndex(result, msg);
                //判断是否跟当前好友在聊天
                    if(msg.sid === right_arrow.sid){
                        msg.infoNum=0;
                        right_arrow.updateFriendChatRecord(msg);
                    }
                    return;
            }
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
            //置顶
            this.topByIndex(index);
            item.infoNum=0;
            this.$set(this.friendli, 0, item);
            //传值到 右边视图
            right_arrow.inputValue="";
            right_arrow.isLt=true;
            right_arrow.updateWindowInfo(item);
        },
        //将某一列置顶
        topByIndex(index) {
            //将位置置顶
            this.friendli.unshift(this.friendli[index]);
            this.friendli.splice(index + 1, 1);
        },
        //修改好友列表某个索引的值
        updateValueByIndex(result, msg) {
            Object.assign(result.value,msg);
            left_arrow.topByIndex(result.index);//置顶
            this.$set(this.friendli, 0, result.value);
        },
        //修改好友列表某个索引值的某个字段
        updateWhereParambByIndex(sid,field,value){
           let result= this.findFriendByid(sid);
           if(!result) return;
            this.friendli[result.index][field] = value;
            Vue.set(this.friendli, result.index, this.friendli[result.index]);
        },
        //修改好友列表某个索引值的某 "些" 字段
        updateWhereParamsbByIndex(sid,fieldObj){
            let result= this.findFriendByid(sid);
            if(!result) return;
            let index=result.index;
            for(let i in fieldObj){
                this.friendli[index][i] = fieldObj[i];
            }
            Vue.set(this.friendli, index, this.friendli[index]);
        }

    }
});

let right_arrow = new Vue({
    el: "#right-arrow",
    data: {
        sid: "",
        name: "",
        tx: "",
        inputValue: "",
        chatRecord: [],
        isLt:false,
        isDisab:false
    },
    methods: {
        //展开聊天窗口
        updateWindowInfo(item) {
            this.chatRecord=[];
            this.name = item.name;
            this.tx = item.tx;
            this.sid = item.sid;
            //遍历聊天记录
            let info = window.localStorage.getItem(item.sid);
            if (!info) return;
            info = info.split("&&");
            var infoArray = [];
            for (let i in info) {
                let code = info[i].indexOf("he") !== -1 ? "he" : "me";
                let msg = info[i].split(":")[1];
                let tx = code === "he" ? this.tx : left_arrow.tx;
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
                tx: left_arrow.tx,
                code: "me",
                msg: this.inputValue,
                date:FormatTime("hh:mm",new Date())
            };
            //发送消息
            ws.send(this.sid + "-" + info.msg);
            //修改好友的最后一条消息记录
            left_arrow.updateWhereParambByIndex(this.sid,"msg",info.msg);
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
                msg.tx=result.value.tx;
                left_arrow.updateValueByIndex(result, msg);//修改信息
            }
            //正在跟当前好友聊天
            if (msg.sid === this.sid) {
                this.updateFriendChatRecord(msg);
                msg.code="he";
                this.chatRecord.push(msg);
            }else{
             //好友未读消息加一
                let result = left_arrow.findFriendByid(msg.sid);
                let num=result.value.infoNum;
                num++;
                left_arrow.updateWhereParambByIndex(msg.sid,"infoNum",num);
            }

        },
        //修改聊天记录容器里的信息
        updateChatRecord(field,value){
            for (let i in this.chatRecord){
                if(this.chatRecord[i].code=="he"){
                    this.chatRecord[i][field] = value;
                    Vue.set(this.chatRecord, i, this.chatRecord[i]);
                }
            }
        },
        //修改容器里好友信息
        updateFriendChatRecord(msg){
            //填充消息到容器
            this.name = msg.name;
            this.tx = msg.tx;
            this.updateChatRecord("tx",this.tx);
        }

    },
    watch: {
        //监听值
        inputValue(val) {
            this.inputValue = val.replace(/[\r\n]/g,"");
            if(!val){
                this.isDisab=false;
                document.querySelector("#send").setAttribute("disabled",true);
            }else{
                this.isDisab=true;
                document.querySelector("#send").setAttribute("disabled",false);
            }
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
