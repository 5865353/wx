package com.ro.websocket;

import com.ro.entity.msg;
import com.ro.util.HttpSessionConfigurator;
import net.sf.json.JSONArray;
import net.sf.json.JSONObject;

import javax.servlet.http.HttpSession;
import javax.websocket.*;
import javax.websocket.server.ServerEndpoint;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.*;

@ServerEndpoint(value = "/websocket", configurator = HttpSessionConfigurator.class)
public class testWebsocket {

    // 静态变量，用来记录当前在线连接数。应该把它设计成线程安全的。
    private static int onlineCount = 0;

    public static final Map<String, testWebsocket> connectio = new HashMap<String, testWebsocket>();

    // 与某个客户端的连接会话，需要通过它来给客户端发送数据
    private Session session;

    private String uid;

    private String name;// 用户名

    private String tx;// 头像

    private HttpSession se;

    /**
     * 连接建立成功调用的方法
     *
     * @param session 可选的参数。session为与某个客户端的连接会话，需要通过它来给客户端发送数据
     */
    @OnOpen
    public void onOpen(Session session, EndpointConfig config) {
        se = (HttpSession) config.getUserProperties().get(
                HttpSession.class.getName());
        String id = se.getId();// 假设是当前本人的id
        System.out.println(id);
        this.uid = id;
        this.session = session;
        if (!connectio.containsKey(uid)) {
            connectio.put(uid, this);
            addOnlineCount(); // 在线数加1
            // 毕业设计 在这里通知---- test 在下方---------------
            System.out.println("有新连接加入！当前在线人数为" + getOnlineCount());
        }

    }

    /**
     * 连接关闭调用的方法
     */
    @OnClose
    public void onClose() {
        connectio.remove(this.uid);
        subOnlineCount(); // 在线数减1
        System.out.println("有一连接关闭！当前在线人数为" + getOnlineCount());
        System.out.println("数组长度" + getMapsize());
    }

    public static synchronized int getMapsize() {
        return connectio.size();
    }

    /**
     * 收到客户端消息后调用的方法
     *
     * @param message 客户端发送过来的消息
     * @param session 可选的参数
     */
    @OnMessage
    public void onMessage(String message, Session session) {
        System.out.println("来自客户端的消息:" + message);
        if (message.equals("&")) {
            // 发送给自己 检测心跳
            toConfirmFriend("&", this.uid, null);
            return;
        }
        String[] split = message.split("-");
        if (message.contains("name")) {// 存放名字
            String[] split2 = split[1].split("&9527&");
            this.name = split2[0];
            this.tx = split2[1];
            connectio.put(this.uid, this);
            // 通知到前台 多少人在线
            if (!(getOnlineCount() < 2)) {
                // 通知给别人上线信息 sessionid --name---不发送给自己
                sendOnline(this.uid);
            }
            return;
        }
        // 判断好友的连接是否存在，不存在就提示好友掉线
        if (!connectio.containsKey(split[0])) {
            msg msg = new msg();
            msg.setCode("inerror");
            msg.setMsg("好友已下线");
            String ms = jsontostring(msg);
            // 发送给自己
            toConfirmFriend(ms, this.uid, null);
            return;
        }
        toConfirmFriend(split[1], split[0], this.uid);
    }

    /**
     * 发生错误时调用
     *
     * @param session
     * @param error
     */
    @OnError
    public void onError(Session session, Throwable error) {
        System.out.println("发生错误");
        error.printStackTrace();
    }

    //获取在线人数
    public static synchronized int getOnlineCount() {
        return onlineCount;
    }

    //在线人数加一
    public static synchronized void addOnlineCount() {
        testWebsocket.onlineCount++;
    }

    //在线人数减一
    public static synchronized void subOnlineCount() {
        testWebsocket.onlineCount--;
    }

    public static synchronized Map<String, testWebsocket> getCollection() {
        return connectio;
    }

    // 发送给指定的好友

    /**
     * @param msg 消息
     * @param zid 接收人人的id
     * @param sid 发送人的id
     */
    public static void toConfirmFriend(String msg, String zid, String sid) {
        testWebsocket client = connectio.get(zid);
        try {
            synchronized (client) {
                if (sid != null) {
                    // 发送给前台
                    testWebsocket s_client = connectio.get(sid);
                    msg mseg = createMsgBean("inmessage", sid, msg, s_client.name);
                    msg = jsontostring(mseg);
                }
                client.session.getBasicRemote().sendText(msg);
            }
        } catch (IOException e) {
            try {
                client.session.close();
            } catch (IOException e1) {
            }
        }
    }

    public static synchronized void sendOnline(String uid) {
        // 获得在线好友
        Map<String, testWebsocket> conection = testWebsocket.getCollection();
        Iterator<String> iterator = conection.keySet().iterator();
        testWebsocket ts = conection.get(uid);
        msg msgBean = createMsgBean("inconnection", uid, ts.name + "已上线", ts.name, ts.tx);
        String msgs = jsontoarray(msgBean);
        List<msg> msgs_li = new ArrayList<msg>();
        while (iterator.hasNext()) {
            String next = iterator.next();
            if (next.equals(uid)) {
                continue;
            }
            //给好友发送 我已上线的信息
            testWebsocket twc = conection.get(next);
            toConfirmFriend(msgs, next, null);
            msg msgss = createMsgBean("inconnection", next, twc.name + "已上线", twc.name, twc.tx);
            msgs_li.add(msgss);
        }
        String jsts = jsontoarray(msgs_li);
        //给自己发送当前在线好友的情况
        toConfirmFriend(jsts, uid, null);

    }

    public static synchronized String jsontostring(msg msg) {
        return JSONObject.fromObject(msg).toString();
    }

    public static synchronized String jsontoarray(Object obj) {
        return JSONArray.fromObject(obj).toString();
    }

    /**
     * @param value 可变参数
     *              0 code
     *              1 sid
     *              2 msg
     *              3 name
     *              4 tx
     * @return
     */
    public static synchronized msg createMsgBean(String... value) {
        msg result = new msg();
        result.setCode(value[0]);
        result.setSid(value[1]);
        result.setMsg(value[2]);
        result.setName(value[3]);
        if(value.length>4){
            result.setTx(value[4]);
        }
        result.setDate(new SimpleDateFormat("HH:mm").format(new Date()));
        return result;
    }
}
