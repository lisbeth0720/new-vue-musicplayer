<template>
<div  class="musicList"  ref="musicContent" @click.self="hideBox()" >
  <div class="listContent" id="showMusicContent">
    <p class="titleContent">
      <span class="listTitle">当前播放列表</span>
      <span class="listCount">({{musicList.length}})</span>
      <span v-show="paramStr.mid != ''" @click="praise()" style="float:right;font-size:18px;cursor:pointer;"><img :src="isPraise ? require('../assets/img/like2.png') : require('../assets/img/like.png')" style="width:18px;margin-right:2px;position:relative;top:3px;">点赞列表({{likenum}})</span>
    </p>
    <div class="ullist">
      <ul class="ulContent" ref="ulBox">
        <li v-for="(item,index) in musicList" :key="index" @click="playMusic(item.itemid,index)" :class="{'playActive':item.itemid==playitem}">  
          <div class="listName">
            <span>{{index+1}}.{{ item.itemname.indexOf('-') != -1 ? item.itemname.split("-")[1].split('_')[0].replace(/amp;/g,'') : item.itemname.replace(/amp;/g,'') }}</span>
            <b>-{{ item.itemname.indexOf('-') != -1 ? item.itemname.split("-")[0].replace(/amp;/g,'') : '无演唱者' }}</b>
          </div>
          <span class="listPlayBtn">
            <i class="listPlayPic" :class="{playActiveImg: isPlay && item.itemid==playitem , playActiveImg2: !isPlay && item.itemid==playitem}"></i>
          </span>
        </li>
      </ul>
    </div>
    
  </div>
</div>
</template>

<script>
import {request,request1} from '@/network/request'
export default {
  name:'List',
  data(){
    return {
      baseURL: '',
      midarr: [],
      likenum: 0,
      isPraise: false,
      obj: {},
      musicList:[],
      playList:[],
      musicName:[],
      musicAuthor:[],
      playPic:require('../assets/img/playlist1.png'),
      playitem:this.paramStr.iid==""?this.paramStr.pid:this.paramStr.iid,
      currentIndex:0,//实际index
      orderIndex:'',//顺序播放的index
      randomIndex:'',//循环播放的index
      playMusicType:0,
    }
  },
  props:{
    showContent:Boolean,
    paramStr:Object
  },
  created() {
    let url = window.location.href
    this.baseURL = url.split('//')[0] + '//' + url.split('//')[1].split('/')[0]
    if(this.$cookies.get('midarr')){
      this.midarr = JSON.parse(this.$cookies.get('midarr'))
      console.log('已点赞的专辑ID:' + this.midarr)
      if(this.midarr.length > 0){
        for(let i of this.midarr){
          if(i == this.paramStr.mid){
            this.isPraise = true
            break
          }
        }
      }
    }
    if(this.paramStr.mid != ''){
      request({
        url:'../../Module/WiseAPI/SongsAPI.ashx',
        params:{
          wpcontentquery: 'online',
          ctype: 1,
          iid: this.paramStr.mid
        },
        method:'get'
      }).then(res => {
        console.log('这个是查询专辑的点赞数：' + res.wpcontentlist[0].credit)
        this.likenum = res.wpcontentlist[0].credit
      })
    }
    this.getList();
  },
  computed:{
    isPlay(){
      return this.$store.state.playStatus
    }
  },
  methods: {
    praise(){
      if(!this.isPraise){
        request1(this.baseURL + '/Module/WiseAPI/getLrcContent.ashx?operation=2&itemid=' + this.paramStr.mid)
        .then(res => {
          console.log(res)
          this.isPraise = true
          this.likenum++
          this.midarr.push(this.paramStr.mid)
          this.$cookies.set('midarr', JSON.stringify(this.midarr))
        })
        .catch(() => {
          console.log('点赞失败')
        })
      }else{
        alert('亲，您今天点过赞了哦！')
      }
    },
    getList() {
      var param={
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
      request({
        url:'../../Module/WiseAPI/SongsAPI.ashx',
        params:param,
        method:'get'
      }).then(res=>{
        console.log('这个是音乐列表返回值：')
        console.log(res)
        if(res.error=="0"){
          this.musicList=res.wpcontentlist;
          let musiclist = JSON.parse(sessionStorage.getItem('musiclist'))
          console.log('session中的音乐列表：')
          console.log(musiclist)
          if(musiclist != null && musiclist != undefined && this.paramStr.mid == ''){
            this.musicList = musiclist
          }
          if(this.musicList.length == 0){
            this.$store.commit('changeListLength',1)
            if(Object.keys(this.obj).length == 0){
              let a = setInterval(() => {
                if(Object.keys(this.obj).length != 0){
                  this.musicList.push(this.obj)
                  clearInterval(a)
                }
              }, 0);
            }else{
              this.musicList.push(this.obj)
            }
          }else{
            this.$store.commit('changeListLength',this.musicList.length)
          }
          console.log('这是musiclist的值：',this.musicList)
          if(this.playitem == ''){
            let cacheInfo = JSON.parse(this.$cookies.get('cacheInfo'))
            if(cacheInfo){
              if(this.paramStr.mid || this.paramStr.des){
                for(let i of cacheInfo){
                  if((i.mid == this.paramStr.mid && i.mid != '') || (i.des == this.paramStr.des && i.des != '')){
                    this.playitem = i.itemid
                    break
                  }
                }
                if(!this.playitem){
                  this.playitem = this.musicList[0].itemid
                }
              }else{
                for(let i of cacheInfo){
                  if(i.orderby == this.paramStr.orderby){
                    this.playitem = i.itemid
                    break
                  }
                }
                if(!this.playitem){
                  this.playitem = this.musicList[0].itemid
                }
              }
            }else{
              this.playitem = this.musicList[0].itemid
            }
          }
          this.playList=this.musicList;
          this.filterMusic(this.musicList);
          //监听页面及数据渲染完成后执行的回调函数
          this.$nextTick(() => {
            for(var i=0;i<this.musicList.length;i++){
              if(this.musicList[i].itemid==this.playitem){
                if(this.$refs.ulBox.querySelectorAll("li")[i]){
                  // this.$refs.ulBox.querySelectorAll("li")[i].click();
                  this.$emit('sendcid', [i,i,i]);
                }
                break
              }
            }
          });
        }  
      })
      
    },
    playMusic(id,curIndex){
      if(id == this.playitem){
        this.$parent.playBtn()
      }else{
        this.playitem=id;
        this.orderIndex=curIndex;
        for(var i=0;i<this.playList.length;i++){
          if(this.playList[i].itemid==this.playitem){
            this.randomIndex=i;  
          }  
        }
        if(this.playMusicType==1||this.playMusicType==0){
          this.currentIndex=this.orderIndex
        }else if(this.playMusicType==2){
          
          this.currentIndex=this.randomIndex;
        }
        
        this.$emit('sendcid', [this.currentIndex,this.orderIndex,this.randomIndex]);
        this.$emit('sendId', this.playitem);
        this.hideBox()
      }
      
    },
    playToList(index,type){
      var parent=this.$refs.ulBox;
      var eleItemId="";
      if(index>=0&&index<this.musicList.length){
          eleItemId=this.playList[index].itemid;
      }
      
      if(this.playMusicType==1||this.playMusicType==0){
         if(type=="add"){
          if(index<this.musicList.length){
            parent.querySelectorAll("li")[index].click();
          }else{
            parent.querySelectorAll("li")[0].click();
          }
        }else if(type=="atten"){
          if(index>=0){
            parent.querySelectorAll("li")[index].click();
          }else{
            parent.querySelectorAll("li")[0].click();
          }
        }   
      }else if(this.playMusicType==2){    
        if(type=="add"){
          if(index<this.musicList.length){
            for(var i=0;i<this.musicList.length;i++){
              if(this.musicList[i].itemid==eleItemId){
                parent.querySelectorAll("li")[i].click();
                return ;
              }
            }
          }else{
            eleItemId=this.playList[0].itemid;
            for(var i=0;i<this.musicList.length;i++){
              if(this.musicList[i].itemid==eleItemId){
                parent.querySelectorAll("li")[i].click();
                return ;
              }
            }
          }
        } else if(type=="atten"){
          if(index>=0){
            for(var i=0;i<this.musicList.length;i++){
              if(this.musicList[i].itemid==eleItemId){
                parent.querySelectorAll("li")[i].click();
                return ;
              }
            }
           }else{
              eleItemId=this.playList[0].itemid;
              for(var i=0;i<this.musicList.length;i++){
                if(this.musicList[i].itemid==eleItemId){
                  parent.querySelectorAll("li")[i].click();
                  return ;
                }
              }
           }
        }  
      }
     
    },
    //关闭列表
    hideBox(){
      this.$emit('changShow', false);
    },
    changeListOrder(type){
      if(type==1){
        this.playList=this.musicList
      }else if(type==2){
        let eleArr=this.musicList
        let eleArr1=JSON.parse(JSON.stringify(eleArr))
        this.playList=this.shuffleSelf(eleArr1, eleArr1.length);
      }
      this.playMusicType=type;
    },
    //生成随机播放列表
    shuffleSelf(array,size){
      var index = -1,
      length = array.length,
      lastIndex = length - 1;
 
      size = size === undefined ? length : size;
      while (++index < size) {
          // var rand = baseRandom(index, lastIndex),
          var rand = index + Math.floor( Math.random() * (lastIndex - index + 1))
          var value = array[rand];

          array[rand] = array[index];

          array[index] = value;
      }
      array.length = size;
      return array;
    },
    filterMusic(data){
      for(var i=0;i<data.length;i++){
        if(data[i].itemname.indexOf('-') != -1){
          this.musicAuthor.push(data[i].itemname.split("-")[0]);
          this.musicName.push(data[i].itemname.split("-")[1]);
        }else{
          console.log('第' + i + '个歌命名有误')
          this.musicAuthor.push('无名');
          this.musicName.push(data[i].itemname);
        }
      }
    }
  },
  watch:{
    "$store.state.itemname" : {
      handler(){
        if(this.musicList.length == 0 && this.$store.state.itemid != ''){
          this.obj = {
            itemname: this.$store.state.itemname,
            itemid: this.$store.state.itemid
          }
        }
      },
      immediate: true
    },
    "$store.state.itemid" : {
      handler(){
        if(this.musicList.length == 0 && this.$store.state.itemname != ''){
          this.obj = {
            itemname: this.$store.state.itemname,
            itemid: this.$store.state.itemid
          }
        }
      },
      immediate: true
    }
  }
}

</script>

<style scoped>
ul,li{
  list-style: none;
}
.musicList{
  display: block;
  position: absolute;
  background: #aaa0;;
  top: 0;
  width: 100%;
  height: 100%;
  
}

.listContent{
  display: flex;
  flex-direction: column;
  width: 80%;
  margin: auto;
  height: 300px;
  background: #525355;
  bottom: 0;
  position: absolute;
  margin-left: 10%;
  border-radius: 10px 10px 0px 0px;
  box-shadow: #666 0px 0px 5px;
  color: #fff;
  animation:myfirst 0.2s;
  -webkit-animation:myfirst 0.2s;
  animation-fill-mode: forwards;/*当动画完成时，动画会停留在最后一帧。*/
}
@keyframes myfirst /* Safari and Chrome */
{
    0%   {height: 10px}
    10%  {height: 30px;bottom:0;} 
    25%  {height:50px;bottom:0;}
    40%  {height:80px;bottom:0;}
    50%  {height:100px;bottom:0;}
    60%  {height:150px;bottom:0;}
    75%  {height:180px; bottom:0;}
    90%  {height:250px; bottom:0;}
    100% {height:300px;bottom:0;}
}
.titleContent{
  align-items: baseline;
  width: 80%;
  text-align: left;
  margin: auto;
  margin-top:10px;
  margin-bottom: 10px;
}
.listTitle{
  font-size: 18px;
}
.listCount{
  font-size: 14px;
}
.ullist{
  flex:8;
  overflow: hidden;
  width: 80%;
  margin: auto;
  margin-bottom: 20px;
}
.ulContent{
  display: block;
  width: 96%;
  height: 100%;
  overflow: auto;
  margin: auto;
}
.ulContent li{
  width: 100%;
  height: 40px;
  line-height: 40px;
  float: left;
  /* display: flex;
  justify-content: space-between; */
}
.listName{
  width: calc( 100% - 25px );
  height: auto;
  overflow: hidden;
  float: left;
  text-align: left;
  text-overflow:ellipsis;
	white-space:nowrap;
}
.listName b{
  font-size: 10px;
  transform: scale(0.8);
  color: #aaa;
}
.listPlayBtn{
  float: right;
  display: flex;
}
.listPlayPic{
  height:25px;
  width: 25px;  
  background:  url('../assets/img/playlist1.png') no-repeat !important;
  background-size: 100% 100% !important;
  position: relative;
  top: 7.5px;
}
.listCount span{
    font-size: 12px;
    transform: scale(0.8);
    color: #aaa;
}
.playActive{
  color: red;
}
.playActive b{
  color: red;
}
.playActiveImg{
  background:  url('../assets/img/pauseList.png') no-repeat !important;
  background-size: 100% 100% !important;
}
.playActiveImg2{
  background:  url('../assets/img/playlist2.png') no-repeat !important;
  background-size: 100% 100% !important;
}
</style>
