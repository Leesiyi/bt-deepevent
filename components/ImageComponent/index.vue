<template>
    <img class="yowin-img" :src="localSrc">
</template>
<script>
import { reactive, toRefs, watch } from 'vue'
import defaultIcon from '../../assets/images/default_icon.svg'
export default {
    props:{
        src:{},
        defaultImg:{
            default:defaultIcon
        }
    },
    setup(props) {
        const state = reactive({
            localSrc:props.defaultImg,
            lastestSrc:''
        })
        const onerror = (e)=> {
            // console.log('img-error',e);
            const src = Filefilter(e.path[0].src)
            if(src === state.lastestSrc){
                // console.log('error-success');
                state.localSrc = props.defaultImg
            }
        }
        const onload = (e)=> {
            // console.log('img-load',e.path[0].src,state.lastestSrc);
            const src = Filefilter(e.path[0].src)
            if(src === state.lastestSrc){
                // console.log('load-success');
                state.localSrc = state.lastestSrc
            }
        }
        const Filefilter = (url)=> {
            const reg = 'file://'
            if(url.indexOf(reg) === -1){
                return url
            }
            return url.replace(reg,'')
        }
        watch(()=>props.src,(newVal,oldVal)=>{
            // console.log('newVal:',newVal,'oldVal:',oldVal);
            if(!newVal){
                return
            }
            state.lastestSrc = newVal
            const imgEl = document.createElement('img')
            imgEl.onload = onload
            imgEl.onerror = onerror
            imgEl.src = newVal
        },{immediate:true})
        return{
            ...toRefs(state),
            onerror,
            onload,
        }
    }
}
</script>
<style lang="less" scoped>
.yowin-img{
    height: 100%;
    width: 100%;
    display:block;
    border-radius: inherit;
}
</style>