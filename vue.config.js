
module.exports={
    // 修改output.path
    publicPath: './',
    outputDir: 'dist',
    assetsDir: "static",
    indexPath: 'index.html',
    configureWebpack:{
        resolve:{
            alias:{
                'assets':'@/assets',
                'common':'@/common',
                'components':'@/components',
                'network':'@/network',
                'views':'@/views'
            }
        }
    }
    // devServer: {
    //   proxy: { //配置跨域
    //     '/163': {
    //       target: 'https://music.163.com/api/song/lyric', //这里后台的地址模拟的;应该填写你们真实的后台接口
    //       changOrigin: true, //允许跨域
    //       pathRewrite: {
    //         '^/163': '' //请求的时候使用这个api就可以
    //       }
    //     }
    //   }
    // }
}