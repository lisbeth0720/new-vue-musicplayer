<template>
  <div id="app">
    <player @showList="showMusic($event)" @playToList="playToList" @sendType="sendType" :listNoid="noid" :listcid="cid" :orderid="orderid" :randomid="randomid" :playType="playType" ref="playerref" :paramStr="paramStr"></player>
    <list :showContent="showMusicList" v-show="showMusicList" @changShow="changeShowShadow($event)" @sendId="sendId($event)" @sendcid="sendcid($event)" ref="playListRef" :paramStr="paramStr"></list>
  </div>
</template>

<script>
//http://192.168.1.10:8080/?cp=wisepeak&cn=%E9%9F%B3%E4%B9%90%E6%92%AD%E6%94%BE%E5%B1%8F&tag=&mn=&mid=9396&pid=9382&ct=&uid=&rn=715804
var url=window.location.search;
var itemid="";  // itemid
var contenttype="";  //contenttype
var Tag="";
var mid="";
var uid="";
var mn="";
var cn="";
var iid="";
var cp="";
var pid="";
var ct=""; //contenttype
var des = ''
var orderby = ''
var rn = ''
var amount = ''
var desc = ''
if(url.indexOf("orderby")>=0){
  orderby=url.split("orderby=")[1];
  if(orderby.indexOf("&")>=0){
    orderby=orderby.split("&")[0]
  }
}
if(url.indexOf("rn")>=0){
  rn=url.split("rn=")[1];
  if(rn.indexOf("&")>=0){
    rn=rn.split("&")[0]
  }
}
if(url.indexOf("des=")>=0){
  des=url.split("des=")[1];
  if(des.indexOf("&")>=0){
    des=decodeURI(des.split("&")[0])
  }
}
if(url.indexOf("iid")>=0){
  iid=url.split("iid=")[1];
  if(iid.indexOf("&")>=0){
    iid=iid.split("&")[0]
  }
}
if(url.indexOf("cp")>=0){
  cp=url.split("cp=")[1];
  if(cp.indexOf("&")>=0){
    cp=cp.split("&")[0]
  }
}
if(url.indexOf("itemid")>=0){
  itemid=url.split("itemid=")[1];
  if(itemid.indexOf("&")>=0){
    itemid=itemid.split("&")[0]
  }
}
if(url.indexOf("ct")>=0){
  contenttype=url.split("ct=")[1];
  if(contenttype.indexOf("&")>=0){
    contenttype=contenttype.split("&")[0]
  }
}

if(url.indexOf("cn")>=0){
  cn=url.split("cn=")[1];
  if(cn.indexOf("&")>=0){
    cn=decodeURI(cn.split("&")[0])
  }
}
if(url.indexOf("ct")>=0){
  ct=url.split("ct=")[1];
  if(ct.indexOf("&")>=0){
    ct=ct.split("&")[0]
  }
  if(ct == ''){
    ct = 9
  }
}
if(url.indexOf("uid")>=0){
  uid=url.split("uid=")[1];
  if(uid.indexOf("&")>=0){
    uid=uid.split("&")[0]
  }
  if(uid == ''){
    uid = sessionStorage.getItem('userid')
    if(uid == null || uid == undefined){
      uid = ''
    }
  }
}
if(url.indexOf("pid")>=0){
  pid=url.split("pid=")[1];
  if(pid.indexOf("&")>=0){
    pid=pid.split("&")[0]
  }
}
if(iid==""){
  if(url.indexOf("mn")>=0){
    mn=url.split("mn=")[1];
    if(mn.indexOf("&")>=0){
      mn=decodeURI(mn.split("&")[0])
    }
  }
  if(url.indexOf("mid")>=0){
    mid=url.split("mid=")[1];
    if(mid.indexOf("&")>=0){
      mid=mid.split("&")[0]
    }
  }
  if(url.indexOf("tag")>=0){
    Tag=url.split("tag=")[1];
    if(Tag.indexOf("&")>=0){
      Tag=Tag.split("&")[0]
    }
  }
  if(url.indexOf("amount")>=0){
    amount=url.split("amount=")[1];
    if(amount.indexOf("&")>=0){
      amount=amount.split("&")[0]
    }
  }
  if(url.indexOf("desc")>=0){
    desc=url.split("desc=")[1];
    if(desc.indexOf("&")>=0){
      desc=desc.split("&")[0]
    }
  }
}
document.documentElement.addEventListener('touchstart', function (event) {
  if (event.touches.length > 1) {
    event.preventDefault();
  }
}, false);

var lastTouchEnd = 0;
document.documentElement.addEventListener('touchend', function (event) {
  var now = Date.now();
  if (now - lastTouchEnd <= 300) {
    event.preventDefault();
  }
  lastTouchEnd = now;
}, false);
import Player from '@/views/Player'
import List from '@/views/List'
export default {
  name:"App",
  data(){
    return{
      showMusicList:false,
      noid:itemid,
      cid:0,
      orderid:0,
      randomid:0,
      playType:"0",
      paramStr:{
        "cp":cp,
        "cn":cn,
        "tag":Tag,
        "mn":mn,
        "mid":mid,
        "iid":iid,
        "pid":pid,
        "ct":ct,
        "uid":uid,
        orderby,
        rn,
        des,
        amount,
        desc
      }
    }
  },
  components:{
    Player,
    List
  },
  methods: {
    //从播放页读取是否需要展示列表页
    showMusic(res) {
      this.showMusicList=res
    },
    //从列表页读取是否需要关闭列表页
    changeShowShadow(res){
      this.showMusicList=res;
    },
    //接受点击播放的音频id
    sendId(res){
      this.noid=res;
      this.$refs.playerref.getNowInfo(this.noid);
    },
    // 播放/暂停音乐
    playBtn(){
      this.$refs.playerref.playMusic()
    },
    // // 控制播放列表播放图标
    // isPlay(){
    //   this.$refs.playListRef.isPlay = !this.$refs.playListRef.isPlay
    // },
     //接受点击播放的音频index
    sendcid(res){
      this.cid=res[0];
      this.orderid=res[1];
      this.randomid=res[2];
      //this.$refs.playerref.getNowInfo(this.noid);
    },
    playToList(playIndex,str){
      //console.log(playIndex)
      this.$refs.playListRef.playToList(playIndex,str);
    },
    sendType(res){
      this.playType=res;
      this.$refs.playListRef.changeListOrder(res);
    }
  },
}
</script>

<style>
*{
  margin:0;
  padding:0;
}
body,html{
  width:100%;
  height:100%;
}
body{
  background:url("./assets/img/playBg.jpg") no-repeat;
  background-size:100% 100%;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #c6c6c6;
  width: 100%;
  height: 100%;
}

</style>
