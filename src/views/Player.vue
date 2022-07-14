<template>
    <div id="playContent">
        <p class="musicTitle" v-if="itemname.length>9">
            <marquee behavior="scroll" scrollamount="5" scrolldelay="10">{{itemname.split('_')[0]}}</marquee> 
        </p>
        <p class="musicTitle" v-else>{{itemname.split('_')[0]}}</p>
        <p class="author">{{author}}</p>
        <!-- 封面图片 -->
        <div class="picContent"  @click.self="isMore = false">
          <div class="out" v-show="isHide">
            <div :class="{roll: activeSing}">
              <div class="inner">
                  <img ref="pic" :src="picUrl" :onerror="defaultImg"/>   
              </div>
            </div>
          </div>
          <!-- 唱片杆 -->
          <div class="musicrod" v-show="isHide">
            <img :class="{'activeSing':activeSing}" src="~assets/img/musicrod.png" :onerror="musicrod" />
          </div>
          <!-- 点赞 -->
          <div style="position:absolute;left:10%;bottom:0;text-align:left;">
            <div style="cursor:pointer;" @click="praise()" title="点赞好音乐">
              <img :src="isPraise ? require('../assets/img/like2.png') : require('../assets/img/like.png')" style="width:25px;margin-right:2px;position:relative;top:4px;">
              <span style="font-size:20px;">{{likenum}}</span>
            </div>
          </div>
          <!-- (更多选项)图标 -->
          <img @click="moreOption()" v-show="!isEdit" src="../assets/img/more.png" alt="更多选项" title="更多选项" style="width: 25px;position:absolute;right:10%;bottom:0;cursor:pointer;">
          <!-- 更多选项中的内容 -->
          <transition name="fade">
            <div v-show="isMore && !isEdit && !isReport" class="moreoption">
              <div v-show="isrank" @click="editLrc()" style="display:flex;margin-bottom: 10px;cursor:pointer;">
                <img src="../assets/img/edit.png" alt="编辑歌词" style="width:20px;margin-right:5px;">
                <span>编辑歌词</span>
              </div>
              <div @click="showQr()" style="display:flex;margin-bottom: 10px;cursor:pointer;">
                <img src="../assets/img/QRcode.png" alt="生成二维码" style="width:20px;margin-right:5px;">
                <span>二维码</span>
              </div>
              <div @click="report()" style="display:flex;cursor:pointer;">
                <img src="../assets/img/report.png" alt="投诉" style="width:20px;margin-right:5px;">
                <span>投诉</span>
              </div>
            </div>
          </transition>
          <!-- 编辑状态下的按钮 -->
          <div v-show="isEdit" style="position:absolute;right:calc(10% - 10px);bottom:0;">
            <img src="~assets/img/submit.png" @click="saveLrc()" style="width:16px;margin-right:20px;cursor:pointer;" alt="保存" title="保存">
            <img src="~assets/img/save.png" @click="testLrc()" style="width:16px;margin-right:20px;cursor:pointer;" alt="测试" title="测试">
            <img src="~assets/img/cancle.png" @click="backIndex()" style="width:16px;cursor:pointer;" alt="返回" title="返回">
          </div>
          <div v-show="isEdit" style="position:absolute;right:calc(10% - 10px);bottom:30px;">
            <img src="../assets/img/slow.png" @click="changeLrcTime(-1)" style="width:16px;margin-right:20px;cursor:pointer;" alt="慢1秒" title="慢1秒">
            <img src="../assets/img/quick.png" @click="changeLrcTime(1)" style="width:16px;cursor:pointer;" alt="快1秒" title="快1秒">
          </div>
        </div>
        <!-- 歌词内容 -->
        <div class="lrcContent" ref="lrcContent">
           <ul ref="ulList" v-show="!isEdit">
              <li v-for="(item,index) in lrcContent" :key="index" :dataindex="index" @click.self="isMore = false">{{item}}</li>
           </ul>
           <textarea v-show="isEdit" v-model="editlrccontent"></textarea>
        </div>
        <!-- 进度条 -->
        <div class="content-box" 
             @touchmove="moveTouchBar($event)" 
             @mousemove="moveTouchBar2($event)" 
             @touchend="endTouchBar($event)" 
             @mouseup="endTouchBar($event)">
            <div class="timeBlock">
                <div class="left-box played-progress">{{playedProgress}}</div>
                <div class="right-box all-progress" >{{allProgress}}</div>
            </div>
            <div class="timeBlock" v-show="isLoad" style="height:16px;text-align:center;font-size:14px;position: absolute;top: -3px;">加载中...</div>
            <div class="center-box" @click="clickSiderBar($event)"> 
              <div class="slider-bar" ref="silider">
                <div class="slider-progress" ref="progress">
                    <div class="slider-dot-control" ref="curPos" 
                    @mousedown="startTouchBar2($event)" 
                    @touchstart="startTouchBar($event)" ></div>
                </div>
              </div>
            </div>
        </div>
        <!-- 音频组件 -->
        <div class="playBar">
            <audio ref='audio' controls @play="playAudioMusic()" @pause="pauseAudioMusic()" @canplay="canplayMusic()" @timeupdate="timeUpdateMusic()" @ended="endMusic()" @loadstart="isLoad = true" @waiting="isLoad = true">
              <!-- <source src="http://www.satall.cn/privatefiles/wisepeak/av/有没有 - 薛之谦.flac" type="audio/flac"> -->
              <!-- <source :src="misicurl" type="audio/flac"> -->
              抱歉您的浏览器不支持，请更换其他浏览器尝试
            </audio>
        </div>
        <!-- 控制按钮 -->
        <div class="playBtn">
            <ul>
                <li>
                    <img :src="playCirclePic" @click="changePlayStatus()"/>
                </li>
                <li>
                    <img src="~assets/img/before.png" @click="beforeMusic()"/>
                </li>
                <li>
                    <img style="width:50%;max-width:70px;" :src="playSrc" class="playMusic" ref="playBtn" @click="playMusic()" />
                </li>
                <li>
                    <img src="~assets/img/next.png" @click="nextMusic()"/>
                </li>
                <li style="position:relative;">
                    <img src="~assets/img/playList.png" @click="showList()"/>
                    <span v-show="listLength != 0" style="width:100%;position:absolute;top:29px;left:0;text-align:center;font-size:14px;">{{'共' + listLength + '首'}}</span>
                </li>
            </ul>
        </div>
        <!-- 提示自动播放 -->
        <div v-show="isAuto" class="bg" @click="closebg()">
          <span style="color:#fff;font-size:20px;">点击页面播放</span>
        </div>
        <!-- 举报组件 -->
        <div v-show="isReport" class="report">
          <div>
            <span style="display:inline-block;margin-bottom:5px;font-size:18px;">1.投诉类型：</span><br>
            <label v-for="(item,index) in reportArr" :key="index">
              <input type="radio" v-model="reportType" :value="index + 1" style="margin-right: 5px;">{{item}}
            </label>
          </div>
          <div style="margin-top: 10px;flex: 1;">
            <span style="display:inline-block;margin-bottom:5px;font-size:18px;">2.投诉内容：</span><br>
            <textarea v-model="reportContent"></textarea>
          </div>
          <div style="text-align:center;">
            <button @click="reportSubmit()">提交</button>
            <button @click="closeReport()">关闭</button>
          </div>
        </div>
        <!-- 二维码组件 -->
        <div v-show="isQr" class="bg" @click="isQr = false">
          <vue-qr ref="Qrcode" 
          :text="dataObj.text" 
          :logoSrc="dataObj.logo" 
          qid="testQrId"></vue-qr>
        </div>
    </div>
</template>

<script>
import {request,request1} from '@/network/request'
import VueQr from 'vue-qr'

import {jsmediatags} from '../jsmediatags'

export default {
    name:'Player',
    components:{
      VueQr
    },
    data(){
        return {
            cacheCur: 0,  //  要改变第几个缓存数
            cacheInfo: JSON.parse(this.$cookies.get('cacheInfo')),    // cookie中的缓存音乐信息
            cacheDetailedInfo: null,    // cookie中的缓存音乐详细信息
            musiclist: [],    // 播放列表
            merit: -1,   // 上传当前音乐者的优先级   
            dataObj: {    
              text: window.location.href,
              logo: require('../assets/logo.png')
            },       // 二维码跳转的地址和Logo图片
            isQr: false,    // 是否打开二维码
            loginData: {},  // 存储登录数据
            isHide: true,   // 是否隐藏音乐转盘
            isPhone: false,   //是否为手机端
            itemid: this.paramStr.iid==""?this.paramStr.pid:this.paramStr.iid,     // 当前音乐ID(初始值为链接中的iid或pid)
            iidarr: [],     // 已点赞的音乐ID集合
            isPure: false,  // 是否为纯音乐
            userid: '',     // 用户id
            isMore: false,  // 是否点击了更多
            isPraise: false,  // 是否已点赞
            likenum: 0,   // 点赞量
            cur: 0,    // 计数作用，目前播放了多少首音乐
            reportArr: ['非原唱','音质不好','歌词错','版权问题','反动','黄色','暴力','其它'],
            reportContent: '',  //投诉内容
            reportType: 8,      //投诉类型
            isReport:false,  // 是否打开投诉页面
            isrank: false,   //  编辑歌词的权限是否拥有
            editlrccontent: '',   //要编辑的歌词
            resetstr: '',         //用于存储原歌词内容
            isEdit: false,  //是否为编辑歌词状态
            isAuto: false,  //是否自动播放
            musicInfo:{},   // 存储当前播放的音乐信息
            itemname:"",
            author:"",
            picUrl:"",
            lrc:"",  
            filterLrc:[],
            lrcContent:[],
            misicurl:"",
            baseURL:'http://www.satall.cn',
            power:false,    // 是否长按拖拽按钮
            lastX:0,
            playedProgress:'00:00',
            allProgress:'00:00',
            playSrc:require('../assets/img/play.png'),
            lineNo:0,
            currenLine:0,
            showMusicList:false,
            playCircleStatus:1,//0:单曲循环 1：列表顺序 2：列表随机
            playCirclePic:require('../assets/img/order.png'),
            activeSing:false,//设置属性来判断唱片杆的位置
            defaultImg:'this.src="' + require('../assets/img/default.jpg') + '"',
            musicrod: 'this.src="musicplayer/' + require('../assets/img/musicrod.png') + '"',
            isLoad: false,  // 是否在加载中
            isLoadCache: true   //  是否已加载了缓存
        }
    },
    props:{
        listNoid:String,
        //列表页正在播放的index
        listcid:Number,
        orderid:Number,
        randomid:Number,
        paramStr:Object
    },
    created() {
        let url = window.location.href
        this.baseURL = url.split('//')[0] + '//' + url.split('//')[1].split('/')[0]
        console.log('这个是域名：' + this.baseURL)

        request1(this.baseURL + '/company/ajax/Getauthbtn.ashx')
        .then(res => {
          console.log('这个是登录接口返回值：')
          console.log(res.data)
          let data = res.data
          this.loginData = data
          this.loginData.isrank = '0'
          if(data.code == '0'){
            if(data.IsSuper == '0'){
              this.isrank = true
            }else{
              if(this.Andhexstring(data.rightstring,'0100') == '0100'){
                //console.log('当前用户有编辑歌词权限')
                this.loginData.isrank = '1'
              }
            }
          }
        })

        if(this.$cookies.get('iidarr')){
          this.iidarr = JSON.parse(this.$cookies.get('iidarr'))
          console.log('已点赞的音乐ID:' + this.iidarr)
        }
        
        let auto = 0
        if(url.indexOf("auto") > -1){
          auto = url.split("auto=")[1].split("&")[0]
        }
        console.log('这是auto的值：' + auto)
        if(auto == 1){
          this.isAuto = true
        }

        
        this.getNowInfo(this.itemid)

        if(this.paramStr.uid != ''){
          console.log('当前用户的id为：' + this.paramStr.uid)
        }

        this.isMobile()
    },
    methods: {
        // 关闭投诉组件
        closeReport(){
          this.isReport = false
          this.isHide = true
        },
        // 改变歌词时间
        changeLrcTime(val){
          let reg = /\[(\d+:.+?)\]/g
          let newlrc = []
          let timeRegArr =[]
          let lrcarr = this.editlrccontent.split('\n')
          for(let i of lrcarr){
            timeRegArr = i.match(reg);
            if(!timeRegArr){
              newlrc.push(i)
            }else{
              let start = 0
              let newtimearr = []
              for (let j in timeRegArr) {
                if (timeRegArr.hasOwnProperty(j)) {
                  let time = timeRegArr[j].replace('[','').replace(']','').split('.')[0]
                  let lasttime = timeRegArr[j].replace('[','').replace(']','').split('.')[1]
                  time = '[' + this.duration(this.changeTime(time) + val) + '.' + lasttime + ']'
                  newtimearr.push(time)
                  start += timeRegArr[j].length; //计算歌词位置
                }
              }
              let str = newtimearr.join('') + i.substring(start)
              newlrc.push(str)
            }
          }
          this.editlrccontent = newlrc.join('\n')
        },
        // 以下四个函数为判断当前用户是否拥有编辑歌词权限
        Andhexstring(ins1, ins2) {
            var k = 0;
            var i = 0
            var s1 = "";
            var s2 = "";
            if (ins1 == "" || ins1 == null || ins1 == undefined) {
                return -1;
            }
            else
                s1 = ins1.trim();
            if (ins2 == "" || ins2 == null || ins2 == undefined)
                return -1;
            else
                s2 = ins2.trim();
            var str = "";
            var get_ch1 = "";
            var get_ch2 = "";
            var Lstr = "";
            var Rstr = "";
            var len = 0;
            var dealstrlen = 0;
            var needaddzero = "";//如果s2比s1长，则返回时，要左添0
            if (s1 != "" && s2 != "") {
                if (s2.length > s1.length) {
                    dealstrlen = s2.length - s1.length;
                    Lstr = s2;
                    Rstr = s1;
                    len = s1.length;
                    for (k = 0; k < dealstrlen; k++) {
                        needaddzero = needaddzero + "0";
                    }
                }
                else if (s1.length == s2.length) {
                    dealstrlen = 0;
                    Lstr = s2;
                    Rstr = s1;
                    len = s1.length;
                }
                else {
                    dealstrlen = s1.length - s2.length;
                    Lstr = s1;
                    Rstr = s2;
                    len = s2.length;
                }
                for (i = 0; i < len; i++) {
                    get_ch1 = Lstr.substr((i + dealstrlen), 1);
                    get_ch2 = Rstr.substr(i, 1);
                    if (get_ch1 == "") get_ch1 = "0";
                    if (get_ch2 == "") get_ch2 = "0";
                    str = str + this.Andhexwithchar(get_ch1, get_ch2);
                }
                str = needaddzero + str;//注意，如果多权限组合查询，比如s1="ffa"，则其中还存在大小写区分，本处返回的为大写
            }
            return str;
        },
        Andhexwithchar(s1, s2) {
            var num1 = this.Hextoint(s1);
            var num2 = this.Hextoint(s2);
            var num3 = num1 & num2;
            return this.Inttohex(num3);
        },
        Hextoint(charunit) {
            var h = 0;
            switch (charunit) {
                case "0": h = 0; break;
                case "1": h = 1; break;
                case "2": h = 2; break;
                case "3": h = 3; break;
                case "4": h = 4; break;
                case "5": h = 5; break;
                case "6": h = 6; break;
                case "7": h = 7; break;
                case "8": h = 8; break;
                case "9": h = 9; break;
                case "a": h = 10; break;
                case "b": h = 11; break;
                case "c": h = 12; break;
                case "d": h = 13; break;
                case "e": h = 14; break;
                case "f": h = 15; break;
                case "A": h = 10; break;
                case "B": h = 11; break;
                case "C": h = 12; break;
                case "D": h = 13; break;
                case "E": h = 14; break;
                case "F": h = 15; break;
                default: h = 0; break;
            }
            return h;
        },
        Inttohex(inum) {
            var h = "";
            switch (inum % 16) {
                case 0: h = "0"; break;
                case 1: h = "1"; break;
                case 2: h = "2"; break;
                case 3: h = "3"; break;
                case 4: h = "4"; break;
                case 5: h = "5"; break;
                case 6: h = "6"; break;
                case 7: h = "7"; break;
                case 8: h = "8"; break;
                case 9: h = "9"; break;
                case 10: h = "A"; break;
                case 11: h = "B"; break;
                case 12: h = "C"; break;
                case 13: h = "D"; break;
                case 14: h = "E"; break;
                case 15: h = "F"; break;
                default: h = "0"; break;
            }
            return h;
        },
        // 点击了返回按钮
        backIndex(){
          this.isEdit = false
          this.isHide = true
          this.editlrccontent = this.resetstr
        },
        // 判断是否为移动端
        isMobile() {
            let flag = navigator.userAgent.match(
                /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i
            );
            if(flag === null) {
                console.log("pc端");
                this.isPhone = false;
            }else {
                console.log(flag);
                console.log("移动端");
                this.isPhone = true;
            }
        },
        // 点击了更多
        moreOption(){
          this.isMore = !this.isMore
          setTimeout(() => {
            this.isMore = false
          }, 3000);
        },
        // 点赞
        praise(){
          if(!this.isPraise){
            request1(this.baseURL + '/Module/WiseAPI/getLrcContent.ashx?operation=2&itemid=' + this.itemid)
            .then(res => {
              console.log(res)
              this.isPraise = true
              this.likenum++
              this.iidarr.push(this.itemid)
              let currTs = (new Date().getTime() - new Date(new Date().toLocaleDateString()).getTime()) / 1000
              let dayTs = 24 * 60 * 60 
              let s = parseInt(dayTs - currTs)
              this.$cookies.set('iidarr', JSON.stringify(this.iidarr), s)
            })
            .catch(() => {
              console.log('点赞失败')
            })
          }else{
            alert('亲，您今天点过赞了哦！')
          }
        },
        // 投诉提交
        reportSubmit(){
          this.isHide = true
          request1(this.baseURL + '/company/program/ajax/menuComplaint.ashx?Type=AddmenuComplaint&itemid=' + this.clicNoMusic + '&label=' + this.reportType + '&content=' + this.reportContent)
          .then(res => {
            console.log(res)
            this.isReport = false
          }).catch(rej => {
            console.log(rej)
            this.isReport = false
          })
        },
        // 点击了投诉
        report(){
          this.isReport = true
          this.isMore = false
        },
        // 点击生成二维码
        showQr(){
          this.isQr = true
          this.isMore = false
        },
        // 关闭提示播放音乐
        closebg(){
          this.isAuto = false
          this.$refs.audio.play()
          this.$store.commit('changeplayStatus',true)
        },
        // 保存歌词
        saveLrc(){
          this.isHide = true
          this.isEdit = false
          let arr = this.editlrccontent.split('\n')
          this.filterLrcFun(arr)
          request1({
            url: this.baseURL + '/Module/WiseAPI/getLrcContent.ashx?path=' + this.lrc,
            method: 'post',
            data: {
              contents: this.editlrccontent
            }
          })
          .then(res => {
            console.log(res)
            console.log('保存成功')
          })
          .catch(rej => {
            console.log(rej)
            console.log('保存失败')
          })
        },
        // 测试歌词
        testLrc(){
          this.isHide = true
          this.isEdit = false
          let arr = this.editlrccontent.split('\n')
          this.filterLrcFun(arr)
        },
        // 编辑歌词
        editLrc(){
          //this.$refs.audio.pause()
          this.isEdit = true
          this.isMore = false
          this.resetstr = this.editlrccontent
        },
        // 获取音乐
        getNowInfo(id) {
            this.cur++    // 记录播放了多少首歌曲
            // 如果音乐列表为空的话，即为首次加载音乐界面要做的事
            if(this.musiclist.length == 0){
                var params={
                  wpcontentquery:"online",
                  tag:this.paramStr.tag,
                  iid:this.paramStr.mid == "" && this.paramStr.des == "" ? this.paramStr.iid == "" ? this.paramStr.pid : this.paramStr.iid : "",
                  mn:this.paramStr.mn,
                  //mid:'9396',
                  mid:this.paramStr.mid,
                  //ct:'9',
                  ct:this.paramStr.ct,
                // uid:'166',
                  uid:this.paramStr.uid,
                  in:'',
                  bd:'',
                  ed:'',
                  rn:'',
                  ck:'',
                  cn:this.paramStr.cn,
                  orderby:this.paramStr.orderby,
                  des:this.paramStr.des,
                  amount:this.paramStr.amount,
                  desc: this.paramStr.desc,
                  window:'',
                  utf8:'1',
                  markid:'0'
                };
                // 请求音乐列表
                request({
                    url:'../../Module/WiseAPI/SongsAPI.ashx',
                    params
                }).then(res=>{
                    this.musiclist = res.wpcontentlist
                    // 如果id为空值，即链接中未传iid或pid的值，即要播放的歌为音乐列表中第一首歌或为上次听的歌
                    if(id == ''){
                      let cacheInfo = JSON.parse(JSON.stringify(this.cacheInfo))
                      console.log('cacheInfo的值：')
                      console.log(cacheInfo)
                      //  如果缓存中有数据
                      if(cacheInfo){
                        //  看是否为栏目中的歌单或其他音乐集
                        if(this.paramStr.mid != '' || this.paramStr.des != ''){
                          //  从缓存中找到对应的歌单并赋值
                          for(let i in cacheInfo){
                            if((cacheInfo[i].mid == this.paramStr.mid && this.paramStr.mid != '') || (cacheInfo[i].des == this.paramStr.des && this.paramStr.des != '')){
                              //console.log('找到了对应歌单')
                              this.cacheDetailedInfo = JSON.parse(JSON.stringify(cacheInfo[i]))
                              this.musicInfo = JSON.parse(JSON.stringify(cacheInfo[i]))
                              this.cacheCur = i
                              break
                            }
                          }
                          //  未找到上次缓存的音乐并把当前播放的歌存进缓存里
                          if(!this.cacheDetailedInfo){
                            this.musicInfo = this.musiclist[0]
                            let obj = this.musicInfo
                            obj.currentTime = 0
                            obj.mid = this.paramStr.mid
                            obj.des = this.paramStr.des
                            obj.orderby = '4'
                            this.cacheInfo.push(obj)
                            //console.log('未找到上次缓存的音乐并把当前播放的歌存进缓存里')
                            //console.log(this.cacheInfo)
                            this.$cookies.set('cacheInfo',JSON.stringify(this.cacheInfo), '7d')
                            this.cacheCur = this.cacheInfo.length - 1
                          }
                        }else{    //  未传id,mid,des的值(即为实时排行榜音乐)
                          if(this.paramStr.orderby){
                            for(let i in cacheInfo){
                              if(cacheInfo[i].orderby == this.paramStr.orderby){
                                this.cacheDetailedInfo = JSON.parse(JSON.stringify(cacheInfo[i]))
                                this.musicInfo = JSON.parse(JSON.stringify(cacheInfo[i]))
                                this.cacheCur = i
                                break
                              }
                            }
                            //  未找到上次缓存的音乐并把当前播放的歌存进缓存里
                            if(!this.cacheDetailedInfo){
                              this.musicInfo = this.musiclist[0]
                              let obj = this.musicInfo
                              obj.currentTime = 0
                              obj.mid = this.paramStr.mid
                              obj.des = this.paramStr.des
                              obj.orderby = this.paramStr.orderby
                              this.cacheInfo.push(obj)
                              this.$cookies.set('cacheInfo',JSON.stringify(this.cacheInfo), '7d')
                              this.cacheCur = this.cacheInfo.length - 1
                            }
                          }
                        }
                      }else{  //  缓存中无数据
                        this.musicInfo = this.musiclist[0]
                        //  将当前播放的音乐信息存cookie中
                        let obj = this.musicInfo
                        obj.currentTime = 0
                        obj.mid = this.paramStr.mid
                        obj.des = this.paramStr.des
                        if(this.paramStr.mid || this.paramStr.des){
                          obj.orderby = '4'
                        }else{
                          obj.orderby = this.paramStr.orderby
                        }
                        this.cacheInfo = []
                        this.cacheInfo.push(obj)
                        this.$cookies.set('cacheInfo',JSON.stringify(this.cacheInfo), '7d')
                      }
                      // 当登录数据未获取到时要延时赋值给merit（当前音乐的优先级），如果直接赋值会影响判断当前用户是否能编辑歌词
                      if(this.loginData.code){
                        this.merit = parseInt(this.musicInfo.merit)
                      }else{
                        let a = setInterval(() => {
                          if(this.loginData.code){
                            clearInterval(a)
                            this.merit = parseInt(this.musicInfo.merit)
                          }
                        }, 0);
                      }
                      this.dealData()
                    }else{    // id有值，从音乐列表中找到对应音乐并做处理
                      for(let i of this.musiclist){
                        if(i.itemid == id){
                          this.musicInfo = i
                          if(this.loginData.code){
                            this.merit = parseInt(i.merit)
                          }else{
                            let a = setInterval(() => {
                              if(this.loginData.code){
                                clearInterval(a)
                                this.merit = parseInt(i.merit)
                              }
                            }, 0);
                          }
                          this.dealData()
                          break
                        }
                      }
                    }
                })
            }else{    // 以下程序为切歌时要做的事
              // 从session中判断是否为新UI中跳转过来的
              if(JSON.parse(sessionStorage.getItem('musiclist'))){
                request1({
                  url:'../../Module/WiseAPI/SongsAPI.ashx',
                  params:{
                    wpcontentquery:"online",
                    iid:id,
                    cp:'wisepeak',
                    ct: '9'
                  }
                }).then(res => {
                  this.musicInfo = res.data.wpcontentquery.wpcontentlist[0]
                  this.dealData()
                })
              }else{
                for(let i of this.musiclist){
                  if(i.itemid == id){
                    this.musicInfo = i
                    if(this.loginData.code){
                      this.merit = parseInt(i.merit)
                    }else{
                      let a = setInterval(() => {
                        if(this.loginData.code){
                          clearInterval(a)
                          this.merit = parseInt(i.merit)
                        }
                      }, 0);
                    }
                    this.dealData()
                    break
                  }
                }
              }
            }
        },
        // 处理得到的音乐数据
        dealData(){
          this.itemid = this.musicInfo.itemid    // 每次换歌当前音乐id也要换
          this.isPraise = false   // 每次换歌点赞状态都要换成未点赞状态
          if(this.iidarr.length > 0){
            for(let i of this.iidarr){
              if(i == this.itemid){
                this.isPraise = true    // 如果从cookie中发现今日已点赞则切换点赞状态
                break
              }
            }
          }
          request1(this.baseURL + '/Module/WiseAPI/getLrcContent.ashx?operation=1&itemid=' + this.itemid)
          .then(() => {
            console.log('当前音乐播放次数加1')
          }).catch(() => {
            console.log('播放次数增加失败')
          })
          this.likenum = this.musicInfo.credit
          if(this.musicInfo.itemname.indexOf("-")>=0){
            this.itemname=this.musicInfo.itemname.split("-")[1].trim();
            //解决给audio标签设置src属性后音频不能播放的问题
            this.author=this.musicInfo.itemname.split("-")[0].trim();
            if(this.author.indexOf(".")>=0){
              this.author=this.author.split(".")[0];
            }
          }else{
            this.itemname = this.musicInfo.itemname
            this.author = ''
          }
          this.$store.commit('changeitemname' , this.musicInfo.itemname)
          this.$store.commit('changeitemid' , this.musicInfo.itemid)
          let fileurl = this.musicInfo.fileurl
          this.userid = this.musicInfo.userid
          if(this.paramStr.tag == '纯音乐' || this.paramStr.tag == 'puremusic' || this.musicInfo.tags.indexOf('63') != -1){
            this.isPure = true
          }else{
            this.isPure = false
          }
          if(fileurl.indexOf('//') != -1){
            this.getLrc(this.baseURL + '/Module/WiseAPI/getLrcContent.ashx?path=' + fileurl + '&cp=' + this.paramStr.cp + '&userid=' + this.userid)
            if(fileurl.indexOf('music.163.com') != -1){
              let id = fileurl.split('id=')[1]
              this.$refs.audio.src = 'http://music.163.com/song/media/outer/url?id=' + id + '.mp3'
            }else{
              this.$refs.audio.src = fileurl
            }
          }else{
            var that = this
            let musicsrc = this.baseURL + fileurl
            this.$refs.audio.src = musicsrc
            console.log(musicsrc)
            let imgurl = this.baseURL + fileurl.replace("av","pic").replace(".flac",".jpg").replace(".mp3",".jpg").replace(".wav",".jpg").replace(".aac",".jpg");


            //判断封面图片是否存在
            var ImgObj = new Image(); 
            ImgObj.src = imgurl;
            ImgObj.onload = function() {
              that.picUrl = imgurl
            }
            ImgObj.onerror = function() {
              jsmediatags().read(musicsrc,{
                onSuccess: (tag) => {
                  console.log('解析出来的东西：')
                  console.log(tag);
                  var picture = tag.tags.picture;
                  if(picture){
                    var base64String = "";
                    for (var i = 0; i < picture.data.length; i++) {
                      base64String += String.fromCharCode(picture.data[i]);
                    }
                    let url = "data:" + picture.format + ";base64," + window.btoa(base64String)
                    that.picUrl = url
                  }else{
                    that.picUrl = require('../assets/img/default.jpg')
                  }
                },
                onError: (error) => {
                  that.picUrl = require('../assets/img/default.jpg')
                  console.log('未解析成功')
                  console.log(':(', error.type, error.info);
                }
              })
            }


            this.lrc = fileurl.replace("av","txt").replace(".flac",".lrc").replace(".mp3",".lrc").replace(".wav",".lrc").replace(".aac",".lrc");
            console.log(this.baseURL + this.lrc)
            this.getLrc(this.baseURL + '/Module/WiseAPI/getLrcContent.ashx?path=' + this.lrc + '&cp=' + this.paramStr.cp + '&userid=' + this.userid)
          }
        },
        // 获取歌词
        getLrc(address){
          request1(address)
          .then(res => {
            console.log('这个是播放的第' + this.cur + '首音乐')
            console.log('歌词接口返回值：')
            console.log(res)
            let val = res.data[0].lrcContent
            console.log(val)
            if(val[0] == '' && val.length == 1){
              if(this.cur != 1){
                this.$refs.audio.play()
                this.$store.commit('changeplayStatus',true)
              }
              this.editlrccontent = ''
              if(this.isPure){
                this.lrcContent = ['纯音乐无歌词']
              }else{
                this.lrcContent = ['无内容']
              }
              this.$nextTick(() => {
                this.$refs.ulList.getElementsByTagName("li")[0].removeAttribute("class");
              })
            }else{
              this.editlrccontent = ''
              for(let i in val){
                if(val[i] != ''){
                  if(i == val.length - 2){
                    this.editlrccontent += this.convert(val[i])
                  }else{
                    this.editlrccontent += this.convert(val[i]) + '\n'
                  }
                }
              }
              //console.log(this.editlrccontent)
              this.filterLrcFun(val);
            }
          })
          .catch(rej => {
            console.log(rej)
            this.lrcContent = ['无内容']
            this.$nextTick(() => {
              this.$refs.ulList.getElementsByTagName("li")[0].removeAttribute("class");
            })
          })
        },
        // 转换Unicode字符
        convert(val){
          let str = '';
          if(val.indexOf('&#') != -1){
            let arr = val.split(';')
            let strarr = []
            for(let i of arr){
              if(i.indexOf('&#') != -1){
                let a = i.split('&#')
                if(a[0] != ''){
                  strarr.push(a[0])
                }
                strarr.push(String.fromCharCode(a[1]))
              }else{
                strarr.push(i)
              }
            }
            str = strarr.join('')
          }else{
            str = val
          }
          return str; 
        },
        // 开始拖放
        startTouchBar(e){
            var touch=e.touches[0];
            this.power=true;
            this.lastX=touch.clientX;
        },
        startTouchBar2(e){
            // var touch=e.touches[0];
            this.power=true;
            this.lastX=e.clientX;
        },
        // 拖放中
        moveTouchBar(e){  
            var touch=e.touches[0];
            if(this.power){
                var curX=touch.clientX;
                var addW=curX-this.lastX;
                var setW=this.$refs.progress.offsetWidth+addW;
                var maxW=this.$refs.silider.offsetWidth;
                if(setW>=0&&setW<=maxW){
                    this.lastX=curX;
                    var percen=setW/maxW;
                }else if(setW<0){
                    percen=0;
                }else {
                    percen=1;
                }
                this.$refs.progress.style.width=percen*100+"%";
            }
        },
        moveTouchBar2(e){  
            if(this.power){
                var curX=e.clientX;
                var addW=curX-this.lastX;
                var setW=this.$refs.progress.offsetWidth+addW;
                var maxW=this.$refs.silider.offsetWidth;
                if(setW>=0&&setW<=maxW){
                    this.lastX=curX;
                    var percen=setW/maxW;
                }else if(setW<0){
                    percen=0;
                }else {
                    percen=1;
                }
                this.$refs.progress.style.width=percen*100+"%";
            }
        },
        // 结束拖放
        endTouchBar(e){
            if(this.power){
                var setW=this.$refs.progress.offsetWidth;
                var maxW=this.$refs.silider.offsetWidth;
                if(setW>=0&&setW<=maxW){
                    var percen=setW/maxW;
                }else if(setW<0){
                    percen=0;
                }else {
                    percen=1;
                }
                this.$refs.progress.style.width=percen*100+"%";
                this.upDateProgress(percen);
            }
            setTimeout(() => {
              this.power=false;
            }, 0);
        },
        // 跳转播放
        clickSiderBar(e){
          if(!this.power){
            var setW=e.offsetX;
            var maxW=this.$refs.silider.clientWidth;
            if(setW>=0&&setW<=maxW){
                var percen=setW/maxW;
                this.$refs.progress.style.width=percen*100+"%";
                this.upDateProgress(percen);
            } 
          }
        },
        // 更新音乐进度
        upDateProgress(percence) {
            this.$refs.audio.currentTime=percence*(this.$refs.audio).duration;
        },
        // 播放/暂停音乐
        playMusic(){
           if(this.$refs.audio.paused){
                this.$refs.audio.play()
                this.$store.commit('changeplayStatus',true)
            }else {
                this.$refs.audio.pause()
                this.$store.commit('changeplayStatus',false)
            }
        },
        // 播放音乐时触发
        playAudioMusic(){
            this.$refs.playBtn.className='play_bt icon-zanting iconfont';
            this.playSrc=require('../assets/img/pause.png');
            this.activeSing=true;
        },
        // 暂停音乐时触发
        pauseAudioMusic(){
            this.$refs.playBtn.className='play_bt icon-bofang iconfont';
            this.playSrc=require('../assets/img/play.png');
            this.activeSing=false;
        },
        // 可以播放音乐
        canplayMusic(){
           this.isLoad = false
           this.allProgress=this.duration(parseInt(this.$refs.audio.duration))
            if(!this.power){
              if(this.isLoadCache && this.cacheDetailedInfo){
                this.isLoadCache = false
                this.$refs.audio.currentTime = parseInt(this.cacheDetailedInfo.currentTime)
                var prence = this.$refs.audio.currentTime / this.$refs.audio.duration;
                this.$refs.progress.style.width = prence*100+"%";
              }else{
                var prence = this.$refs.audio.currentTime / this.$refs.audio.duration;
                this.$refs.progress.style.width = prence*100+"%";
              }
            }
        },
        // 音乐播放时触发
        timeUpdateMusic(){
          if(this.paramStr.iid == '' && this.paramStr.pid == ''){
            let obj = JSON.parse(JSON.stringify(this.musicInfo))
            obj.mid = this.paramStr.mid
            obj.des = this.paramStr.des
            if(this.paramStr.mid || this.paramStr.des){
              obj.orderby = '4'
            }else{
              obj.orderby = this.paramStr.orderby
            }
            obj.currentTime = this.$refs.audio.currentTime
            this.cacheInfo.splice(this.cacheCur,1,obj)
            //console.log(this.cacheInfo)
            this.$cookies.set('cacheInfo',JSON.stringify(this.cacheInfo), '7d')
          }
          this.isLoad = false
          this.playedProgress=this.duration(parseInt(this.$refs.audio.currentTime))
          var ulStr=this.$refs.ulList;
          let liarr = ulStr.getElementsByTagName("li")
           if(this.filterLrc.length > 0 && liarr.length > 1){
             for(var i=0;i<this.filterLrc.length;i++){
                var eleTime="";
                if(this.filterLrc[i][0].indexOf(".")>=0){
                    eleTime=this.filterLrc[i][0].replace("[","").replace("]","").split(".")[0];
                    if(this.changeTime(eleTime)<=this.changeTime(this.playedProgress)){
                        
                        if(this.lineNo<i){
                            if(i>=1){
                                ulStr.getElementsByTagName("li")[this.lineNo].removeAttribute("class");
                            }
                            this.lineNo = i;
                            ulStr.getElementsByTagName("li")[this.lineNo ].classList.add("activeClass");
                            var el = document.querySelector('.activeClass');
                            var index = [].indexOf.call(el.parentElement.children, el);
                            this.currenLine=index;
                        }else{
                            ulStr.getElementsByTagName("li")[this.lineNo].removeAttribute("class");
                            this.lineNo = i;
                            ulStr.getElementsByTagName("li")[this.lineNo].classList.add("activeClass");
                            
                        }
                       
                    }
                   
                }
            }
           }
            if(!this.power){
                var prence=this.$refs.audio.currentTime/this.$refs.audio.duration;
                this.$refs.progress.style.width=prence*100+"%";
            }
        },
        //监听播放结束事件
        endMusic(){
            if(this.playCircleStatus=="0"){
                var that=this;
                setTimeout(function () {
                    var a=document.getElementsByClassName("lrcContent")[0];
                    that.$refs.audio.play();
                    a.scrollTo(0, 0);
                },200)
            }else if(this.playCircleStatus=="1"){
                //this.listcid;
                var nextindex=this.listcid+1;
                //this.$parent.playToList({nextindex,"add"});
                this.$emit('playToList',nextindex,"add");
                setTimeout(() => {
                  this.$refs.audio.play()
                  this.$store.commit('changeplayStatus',true)
                }, 200);
            }else if(this.playCircleStatus=="2"){
                var nextindex=this.listcid+1;
                this.$emit('playToList',nextindex,"add");
                setTimeout(() => {
                  this.$refs.audio.play()
                  this.$store.commit('changeplayStatus',true)
                }, 200);
            }
            this.$emit('sendType', this.playCircleStatus);
        },
        //下一首
        nextMusic(){
            if(this.playCircleStatus==0||this.playCircleStatus==1){
                this.listcid=this.orderid;
                
            }else if(this.playCircleStatus==2){
                this.listcid=this.randomid;
            }
            var nextindex=this.listcid+1;
            this.$emit('playToList',nextindex,"add");
        },
        //上一首
        beforeMusic(){
            if(this.playCircleStatus==0||this.playCircleStatus==1){
                this.listcid=this.orderid;
                
            }else if(this.playCircleStatus==2){
                this.listcid=this.randomid;
            }
            var nextindex=this.listcid-1;
            this.$emit('playToList',nextindex,"atten");
        },
        //时间转换(将秒转为00:00的形式)
        duration(time){
          if(time < 0){
            return '00:00'
          }else{
            var fen=parseInt(time/60);
            var miao=time%60;
            if(fen<=9){
                fen="0"+fen;
            }
            if(miao<=9){
                miao="0"+miao;
            }
            return fen+':'+miao;
          }  
        },
        //过滤生成单独的歌词数组和时间数组
        filterLrcFun(values){
            var lrcics= values;
            // var reg=/\[\d*:\d*(\.|:)\d*]/g;
            var reg = /\[(\d+:.+?)\]/g
            this.lrcContent=[];
            this.filterLrc=[];
            if(lrcics.length>0){
                for(var i=0;i<lrcics.length;i++){
                    var timeRegArr=lrcics[i].match(reg);
                    if(!timeRegArr){
                        //console.log(lrcics[i])
                        continue;
                    }
                    var start = 0
                    for (var lrc_position in timeRegArr) {
                        if (timeRegArr.hasOwnProperty(lrc_position)) {
                            start += timeRegArr[lrc_position].length; //计算歌词位置
                        }
                    }
                    var content=lrcics[i].substring(start);//获取歌词内容
                    // var content = lrcics[i].replace(timeRegArr,"")
                    if(content!=""){
                        this.lrcContent.push(this.convert(content));
                        this.filterLrc.push(timeRegArr);
                    }   
                }
                //console.log('这个是时间数组：')
                //console.log(this.filterLrc)
            }else{
                 this.lrcContent.push("无内容")
            }
            
             //alert(this.lrcContent);
            var a=document.getElementsByClassName("lrcContent")[0];
            a.scrollTo({
                top:0,
                behavior:"smooth"
            })
            if(this.cur != 1){
              this.$refs.audio.play()
              this.$store.commit('changeplayStatus',true)
            }
        },
        //将分,秒转成秒
        changeTime(value){
            var mTime=parseInt(value.split(":")[0]);
            var sTime=parseInt(value.split(":")[1]);
            return mTime*60+sTime;
        },
        // 调出播放列表
        showList(){
            this.showMusicList=true;
            this.$emit('showList', this.showMusicList);
        },
        // 改变播放模式
        changePlayStatus(){
            if(this.playCircleStatus==0){
                this.playCircleStatus=1;
                this.playCirclePic=require('../assets/img/order.png');  
            }else if(this.playCircleStatus==1){
                this.playCircleStatus=2;
                this.playCirclePic=require('../assets/img/randPlay.png');
            }else if(this.playCircleStatus==2){
                this.playCircleStatus=0;
                this.playCirclePic=require('../assets/img/circle.png')
            }
            this.$emit('sendType', this.playCircleStatus);
        }
        
    },
    watch: {
        //设置监听属性，当歌词行数产生变化时，及时滚动
        currenLine(newValue, oldValue) {
            var a=document.getElementsByClassName("lrcContent")[0];
            var el=document.getElementsByClassName("activeClass")[0]; 
            //算出中间行，在中间位置滚动，且保持当前的最新歌词始终在中间位置
            var middleIndex=Math.floor(parseInt(a.offsetHeight/document.getElementsByClassName("activeClass")[0].offsetHeight)/2);
            if(newValue>middleIndex){
               
                var index = [].indexOf.call(el.parentElement.children, el);
                //以下两种方式都实现滚动，显示的样式略有差异
                // a.scrollTo(0,(document.getElementsByClassName("activeClass")[0].offsetHeight*index));
               a.scrollTo({
                   top:document.getElementsByClassName("activeClass")[0].offsetHeight*(index-middleIndex),
                   behavior:"smooth"
               })
                //滚动效果不带动画
               // this.$refs.ulList.style.transform="translateY(-"+document.getElementsByClassName("activeClass")[0].offsetHeight*(index-3)+"px)";   
            }
           
        },
        merit(){
          if(this.loginData.code == '0'){
            console.log('登录了')
            if(this.loginData.IsSuper == '0'){
              console.log('是超级管理员')
              this.isrank = true
            }else{
              console.log('不是超级管理员')
              if(this.loginData.isrank == '1'){
                console.log('有权限')
                console.log('这个是本地用户的优先级：' + this.loginData.merit + ',这个是音乐优先级：' + this.merit)
                if(parseInt(this.loginData.merit) >= this.merit){
                  console.log('当前用户优先级>=上传音乐用户的优先级')
                  this.isrank = true
                }else{
                  console.log('当前用户优先级<上传音乐用户的优先级')
                  this.isrank = false
                }
              }else{
                console.log('无权限')
                this.isrank = false
              }
            }
          }else{
            console.log('未登录')
            this.isrank = false
          }
        }
    },
    computed: {
       listLength(){
         return this.$store.state.listLength
       }
    },
    mounted() {
      if(this.isPhone){
        const innerHeight = window.innerHeight;
        window.addEventListener('resize', () => {
          const newInnerHeight = window.innerHeight;
          if (innerHeight > newInnerHeight && this.$refs.lrcContent.offsetHeight < 100) {
            // 键盘弹出事件处理
            this.isHide = false
          }
        });
      }
        // setInterval(() => {
        //   let currTs = (new Date().getTime() - new Date(new Date().toLocaleDateString()).getTime()) / 1000
        //   let dayTs = 24 * 60 * 60 
        //   let s = dayTs - currTs
        //   let h = parseInt(s/60/60)
        //   let m = parseInt(s/60 - (h*60))
        //   s = parseInt(s - h*3600 - m*60)
        //   console.log('距今天结束还有' + h + '时' + m + '分' + s + '秒')
        // }, 1000);
    },
    
}
</script>

<style scoped>
* {
    margin: 0px;
    padding: 0px;
    box-sizing: border-box;
    border: none;
}
ul,li{
    list-style: none;
}
body {
    margin: 0;
    padding: 0;
}
#playContent{
    width:100%;
    height: 100%;
    display: flex;
    flex-direction: column;
}
.bg{
    display: flex;
    width: 100vw;
    height: 100vh;
    position: absolute;
    left: 0;
    top: 0;
    justify-content: center;
    align-items: center;
    background: rgba(0, 0 , 0, 0.7);
    cursor: pointer;
  }
.report{
  position: absolute;
  width: 80%;
  height: 50%;
  display: flex;
  flex-direction: column;
  left: 10%;
  top: 25%;
  padding: 20px;
  border-radius: 10px;
  text-align: left;
  background: #fff;
  color: #000;
  overflow: auto;
}
.report label{
  display: inline-block;
  margin-left: 20px;
  margin-bottom: 5px;
}
.report textarea{
  width: 100%;
  height: calc(100% - 30px);
  border: 1px solid #000;
  outline: none;
  resize: none;
  overflow: auto;
}
.report button{
  background: #343a40;
  color: #fff;
  padding: 5px 10px;
  border-radius: 5px;
  margin: 20px 10px 0 10px;
  cursor: pointer;
}
.fade-enter-active, .fade-leave-active {
  transition: opacity .3s;
}
.fade-enter, .fade-leave-to{
  opacity: 0;
}
.moreoption{
  position:absolute;
  right:10%;
  top: calc(100% + 10px);
  padding: 5px 10px;
  background-color: #fff;
  border-radius: 5px;
  color: #2c2c2c;
}
@keyframes spin {

    0% {
        transform: rotateZ(0deg);
    }
    100% {
        transform: rotateZ(360deg);
    }
}

.inner {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    overflow: hidden;

}

.inner img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    /* -webkit-filter: blur(1px); */
    transition-delay: 1.5s;
    transition: all 0.005s ease-in-out;
}

.out {
    width: 160px;
    height: 160px;
    /* border: 1px dashed red; */
    border-radius: 50%;
    /* padding: 5px; */
    margin: 0px auto;
    transform: rotateX(0deg);
    /* transform-origin: center; */
    /* box-shadow: -6px -5px 0px #aaa; */
    -webkit-box-shadow: #666 0px 0px 10px;
    -moz-box-shadow: #666 0px 0px 10px;
    box-shadow: #666 0px 0px 10px;
    margin-top:20px;   
}
.out>div{
    width:100%;
    height:100%;
    animation: spin 10s linear infinite;
        -moz-animation: spin 10s linear infinite;
        -webkit-animation: spin 10s linear infinite;
        -o-animation: spin 10s linear infinite;
        animation-play-state:paused;
}
.roll{
    animation-play-state:running !important;
}
.inner:hover img {
    transform: scale(1.1, 1.1);
    /* -webkit-filter: blur(0px); */
}

/*音乐播放器进度*/
/*滑动时间的样式*/
.slider-bar{
    height:4px;
    width: 100%;
    background-color: #6d6d6d;
    border-radius: 2px;
}
.slider-progress{
    position: relative;
    height: 100%;
    width: 0;
    background-color: #fff;
    border-radius: 2px;
}
.slider-dot-control{
    position: absolute;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    left: 100%;
    background-color: #ff7471;
    border: 6px solid #fff;
    top: 50%;
    margin-top: -7px;
    margin-left: -9px;
    cursor: pointer;
}
/*滑动时间的样式*/
/*播放时间的样式*/
.played-progress,.all-progress{
    display: flex;
    -webkit-justify-content: center;
    justify-content: center;
    padding: 0 10px;
    font-size: 14px;
}
.content-box{
    display: flex;
    height: 20px;
    position: relative;
    color: #eee;
    margin-top: 20px;
    align-items: center;
    flex-direction: column;
    flex:2;
}
.center-box{
    width: 80%;
    height: 100%;
    display: flex;
    align-items: center;
    margin-bottom: 20px;
}
.timeBlock{
    display: block;
    width:80%;
    margin-bottom: 10px;
}
.left-box{
    width: 70px;
    height: 100%;
    text-align: center;
    font-size: 14px;
    flex: 1;
    float: left;
}
.right-box{
    width: 70px;
    height: 100%;
    text-align: center;
    font-size: 14px;
    flex: 1;
    float: right;
}
#playContent{
    overflow: hidden;
}
.musicTitle{
    font-size: 4vh;
    margin: auto;
    margin-top: 20px;
    color: #c6c6c6;
    flex: 1;
    width: 70%;
}
.author{
    color:#c6c6c6;
    margin-top:10px;
    font-size: 20px;
    flex: 1;
}
.picContent{   
    flex: 3;
    position: relative;
}
.musicrod{
    width: 100px;
    height: 100px;
    position: absolute;
    top: 0;
    left: calc(50% + 28px);
    margin-top: 10px;
}
.musicrod img{
    height:100%;
    height: 100%;
    /* transform-origin: right top; */
    transform-origin: 30px 10px;
    transform: rotate(-40deg);
}
.lrcContent{
    flex:10;
    overflow: auto;
    margin-top: 20px;
    scrollbar-width: none; /* firefox */
    -ms-overflow-style: none; /* IE 10+ */
}
.lrcContent::-webkit-scrollbar{
  display: none;
}
.lrcContent textarea{
  width: 80%;
  height: 100%;
  resize: none;
  overflow: auto;
  text-align: left;
  font-size: 20px;
  outline: none;
  /* white-space: pre-wrap; */
}
audio{
    display: none;
}
.playBtn{
    flex: 2;
    margin-bottom: 10px;
    margin-top:10px;
}
.playBtn ul{
    display: flex;
    align-items: center;
}
.playBtn ul li{
    flex: 1;
}
.playBtn ul li:nth-child(3n+3){
    flex: 2;
}
.playBtn ul li img{
    width:40%;
    max-width:25px;
}
.lrcContent li{
    line-height: 30px;
}
.activeClass{
    color: red;
    font-size: 20px;
    text-shadow: 1px 1px 4px #717171;
}
.activeSing{
    transform: rotate(0deg) !important;
}
/* .play_bt{
    background: url('../assets/img/play.png') no-repeat;
} */
/*播放时间的样式*/
</style>
