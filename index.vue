<template>
    <div class="deep-events">
        <div class="header">
            <div class="title">
                <p>{{$t('Half an hour every day')}}</p>
                <p>{{$t('Easily earn')}} <span>{{$t('₹1000')}}</span></p>
            </div>
            <div class="sub-title">{{$t('Complete immediate withdrawal')}}</div>
            <div class="tips">
                <div class="tips-content">{{$t('Bitcoin transaction recharge double cashback')}}</div>
            </div>
            <div class="button-wrapper">
                <div class="aside-button" @click="quickWithdrawModalData.show = true">
                    <p>{{$t('Quick')}}</p>
                    <p>{{$t('Withdrawal')}}</p>
                </div>
                <div class="aside-button" @click="rulesModalData.show = true">{{$t('Rules')}}</div>
            </div>
        </div>
        <div class="main">
            <task-list class="mgt" :list="propsList" :vueState="vueState" :Request="Request" @clickTask="listEventData.clickTask" @clickWithdraw="listEventData.clickWithdraw" @windowTimeOver="listEventData.windowTimeOver" @clickLock="listEventData.clickLock"/>
        </div>
        <rules-modal v-model:show="rulesModalData.show" :vueState="vueState"/>
        <quick-withdraw-modal  v-model:show="quickWithdrawModalData.show" :vueState="vueState"/>
        <rewards-modal v-model:show="rewardsModalData.show" :icon-coin="rewardsModalData.iconCoin" :coin="rewardsModalData.coin"/>
    </div>
</template>
<script>
import { inject, reactive, toRefs,onMounted, computed, onUnmounted, getCurrentInstance } from 'vue'
import TaskList from './components/TaskList/index.vue'
import rulesModal from './modal/rulesModal.vue'
import quickWithdrawModal from './modal/quickWithdrawModal.vue'
import rewardsModal from './modal/rewardsModal.vue'
import {useRequest} from './hooks/useRequest'
import {openBrowser,debounce} from './hooks/utils'
import {initProxyLocalStorage} from './hooks/useIframe'
import axios from 'axios'
import { Toast } from 'vant'
import yowinCoin from './assets/images/icon_coin_yowin.svg'
import cashCoin from './assets/images/icon_coin_hellocash.svg'
import dailybonusCoin from './assets/images/icon_coin_dailybonus.svg'
import yocoinsCoin from './assets/images/icon_coin_yocoins.svg'
export default {
    components:{TaskList,rulesModal,quickWithdrawModal,rewardsModal},
    props:{
        Request:{},
        vueState:{}
    },
    setup(props) {
        // initProxyLocalStorage()
        const {proxy} = getCurrentInstance()
        const vueState = props.vueState
        const Request = props.Request
        const {GetTask,GetTaskStatus,GetTaskRewards} = useRequest()
        const state = reactive({
            isFirst:true,       //是否第一次进入
            cacheList:[],       //本地缓存列表
            taskList:[],        //处理后任务列表
            idList:[],      //本地缓存任务id列表
            newIdList:[],       //处理后任务id列表
            offersList:[],      //更新状态接口入参列表
            statusUpdateList:[],        //状态更新列表
            completedList:[],       //已完成任务列表
            unUpdateIdList:[],      //状态未更新列表
            initTimes:0
        })
        const rulesModalData = reactive({
            show:false
        })
        const quickWithdrawModalData = reactive({
            show:false
        })
        const rewardsModalData = reactive({
            show:false,
            coin:0,
            iconCoin:computed(()=>{
                switch (vueState.bundle) {
                    case 'com.hello.coins.cash':
                        return cashCoin;
                    case 'com.insta.cash.app':
                        return cashCoin;
                    case 'com.daily.bonus1029':
                        return dailybonusCoin;
                    case 'com.touch.midas':
                        return yocoinsCoin;
                    default:
                        return yowinCoin;
                }
            })
        })
        const listEventData = reactive({
            clickLock:(item)=>{
                Toast(`${proxy.$t('You need to complete')} ${item.taskThreshold - item.taskCompleted} ${proxy.$t('tasks to unlock')}`)
            },
            clickTask:debounce(async(item)=> {
                switch (item.localState) {
                    case 'start':
                        track(item.trackingURL)
                        openBrowser(item.landingPage ? item.landingPage : item.trackingURL)
                        break;
                    case 'going':
                        openBrowser(item.landingPage ? item.landingPage : item.trackingURL)
                    case 'done':
                        const rewardStage = item.stages.find(item=>item.state === 'done')
                        try{
                            await getRewards(rewardStage.stageId)
                            rewardsModalData.coin = rewardStage.coin
                            rewardsModalData.show = true
                        }catch(e){
                            console.log(e);
                        }
                        init()
                    default:
                        break;
                }
            },300),
            clickWithdraw:debounce((item)=> {
                if(item.localState === 'completed'){
                    const tabIndex = vueState.bundle === 'com.insta.cash.app' ? 3 : 2
                    window.SDKPostMessage({
                        event:'h5_tab_req',
                        data:{
                            index:tabIndex,
                            sub:{
                                event:'withdraw'
                            }
                        }
                    })
                }
            },300),
            windowTimeOver:(item)=>{
                console.log('windowTimeOver');
                try{
                    state.taskList.forEach((el)=>{
                        if(item.offerId === el.offerId){
                            el.windowTimeOver = true
                            throw new Error()
                        }
                    })
                }catch(e){
                    console.log('forEach-end');
                }
            }
        })
        const propsList = computed(()=>{
            console.log(state.taskList.length ? 'taskList' : 'cacheList',state.taskList,state.cacheList);
            return state.taskList.length ? state.taskList : state.cacheList
        })
        const adShow = debounce(async()=> {
            state.initTimes && await init()
        },1000)
        const track = (url)=> {
            axios.get(url).
            then((res)=>{
                console.log(res);
            })
            .catch((error)=>{
                console.log(error);
            });
        }
        const getRewards = async(taskId,stageId)=> {
            await GetTaskRewards({taskId,stageId})
        }
        console.log('timee',new Date(new Date().toUTCString()).getTime(),new Date().getTime(),new Date().toUTCString());
        /**
         * @description: getCache:获取本地缓存
         * @param {}
         * @return:void
         */
        const getCache = ()=> {
            state.idList = JSON.parse(localStorage.getItem('app_task_id_list') || '[]')
            state.isFirst = !Boolean(localStorage.getItem('app_task_id_list'))
            state.idList && state.idList.length && state.idList.forEach((item)=>{
                state.cacheList.push(JSON.parse(localStorage.getItem(item)))
            })
            console.log('getCache');
        }
        /**
         * @description: getData:获取服务端数据
         * @param {}
         * @return:void
         */
        const getData = async()=> {
            try{
                const task = await GetTask({
                    bundle:vueState.bundle,
                    // channel:'primetask',
                    extension:vueState.pageInfo.header?.country || 'IN',
                    // campaign:'',
                    bundleList:['BTC']
                })
                state.taskList = task
            }catch(e){
                console.log(e);
            }
            console.log('getData');
        }
        /**
         * @description: setData:处理数据
         * @param {}
         * @return:void
         */
        const setData = ()=> {
            state.taskList = state.taskList.map((item)=>{
                const localState = setState(item.stages)
                const localItem = {
                    ...item,
                    localState,
                    localTs:new Date().getTime(),
                    totalCoin:item.stages.reduce((total,currentVal)=>{
                        return (total + currentVal.coin || 0)
                    },0)
                }
                return localItem
            })
            console.log('setData',state.taskList);
        }
        /**
         * @description: setState:设置状态
         * @param {}
         * @return:void
         */
        const setState = (list=[])=>{
            const length = list.length
            let undone = 0
            let completed = 0
            for(let i = 0;i < length;i++){
                if(list[i].state === 'done'){
                    return 'done'
                }
                if(list[i].state === 'completed'){
                    completed++
                }
                if(list[i].state === ''){
                    undone++
                }
            }
            if(completed === length){
                return 'completed'
            }
            if(undone === length){
                return 'start'
            }else{
                return 'going'
            }
        }
        /**
         * @description: setCache:存储本地缓存
         * @param {}
         * @return:void
         */
        const setCache = ()=> {
            // localStorage.setItem('app_task_id_list','12312')
            state.taskList.forEach((item)=>{
                state.idList.push(item.offerId)
                localStorage.setItem(`${item.offerId}`,JSON.stringify(item))
            })
            localStorage.setItem('app_task_id_list',JSON.stringify(state.idList))
            console.log('setCache');
        }
        /**
         * @description: filterCache:过滤本地缓存
         * @param {}
         * @return:void
         */
        const filterCache = ()=> {
            state.taskList.forEach((item)=>{
                //更新本地缓存任务
                localStorage.setItem(`${item.offerId}`,JSON.stringify(item))
                //存入新id列表
                state.newIdList.push(item.offerId)
                //如果本地缓存不存在该任务
                if(state.idList.indexOf(item.offerId) === -1){
                    //存入id列表
                    state.idList.push(item.offerId)
                }
            })
            // console.log(state.taskList,state.idList,state.newIdList);
            state.idList.forEach((item,index)=>{
                //新id列表没有，本地缓存存在的任务
                if(state.newIdList.indexOf(item) === -1){
                    //缓存中获取任务
                    let task = JSON.parse(localStorage.getItem(item) || '{}')
                    //如果任务状态为‘completed’且缓存时间小于3天，存入已完成任务列表
                    if(task.localState === 'completed' && new Date().getTime()-task.localTs < 259200000){
                        state.completedList.push(task)
                        state.newIdList.push(item)
                    }else if(task.localState === 'completed' && new Date().getTime()-task.localTs >= 259200000){   //如果任务状态为‘completed’且缓存时间大于等于3天删除本地缓存
                        localStorage.removeItem(item)
                        state.idList.splice(index,1)
                    }else if(task.localState === 'done' && new Date().getTime()-task.localTs < 5184000000){
                        state.taskList.push(task)
                        state.newIdList.push(item)
                    }else{     //其余情况存入更新状态列表，刷新任务状态
                        state.offersList.push({channel:task.bundleId,offerId:task.offerId})
                        state.unUpdateIdList.push(task.offerId)
                    }
                }
            })
            localStorage.setItem('app_task_id_list',JSON.stringify(state.idList))
            console.log('filterCache',state.offersList);
        }
        /**
         * @description: updateStatus:更新任务状态
         * @param {}
         * @return:void
         */
        const updateStatus = ()=> {
            state.statusUpdateList.length && state.statusUpdateList.forEach((item)=>{
                const task = JSON.parse(localStorage.getItem(item.campaign) || '{}')
                const isShow = state.newIdList.indexOf(item.campaign) === -1 ? false : true
                const index = task.stages.findIndex((el)=>{return el.stageId === item.stageId})
                if(index !== -1 && task.stages[index].state !== item.status){
                    task.stages[index].state = item.status
                    task.localState = setState(task.stages)
                    task.localTs = new Date().getTime()
                    localStorage.setItem(item.campaign,JSON.stringify(task))
                    !isShow && state.taskList.push(task) && state.newIdList.push(item.campaign)
                    state.unUpdateIdList.indexOf(item.campaign) > -1 && state.unUpdateIdList.splice(state.unUpdateIdList.indexOf(item.campaign))
                }
            })
            state.statusUpdateList = []
            console.log('updateStatus');
            
        }
        /**
         * @description: updateCache:更新本地缓存
         * @param {}
         * @return:void
         */
        const updateCache = ()=> {
            state.unUpdateIdList.length && state.unUpdateIdList.forEach((item)=>{
                const task = JSON.parse(localStorage.getItem(item))
                if(new Date().getTime() - task.localTs >= 259200000){
                    localStorage.removeItem(item)
                    state.idList.splice(state.idList.indexOf(item),1)
                }else if(task.localState === 'going' && state.newIdList.indexOf(item) === -1){
                    state.taskList.push(task)
                    state.newIdList.push(item)
                }
            })
            localStorage.setItem('app_task_id_list',JSON.stringify(state.idList))
            state.unUpdateIdList = []
            console.log('updateCache');
        }
        /**
         * @description: getStatus:获取任务状态
         * @param {}
         * @return:void
         */
        const getStatus = async()=> {
            try{
                const list = await GetTaskStatus({offers:state.offersList})
                state.statusUpdateList = list
            }catch(e){
                console.log(e);
            }
            console.log('getStatus');
        }
        /**
         * @description: concatCompletedTask:拼接已完成任务
         * @param {}
         * @return:void
         */
        const concatCompletedTask = ()=> {
            state.taskList.concat(state.completedList)
            state.completedList = []
            console.log('concatCompletedTask');
        }
        /**
         * @description: init:初始化
         * @param {}
         * @return:void
         */
        const init = async()=>{
            // getCache()
            await getData()
            setData()
            state.isFirst ? setCache() : filterCache()
            state.offersList.length && await getStatus()
            updateStatus()
            updateCache()
            concatCompletedTask()
            state.initTimes++
        }
        initProxyLocalStorage(getCache)
        
        onMounted(() => {
            window.AdSDK.addEventListener('ad_show',adShow)
            vueState.EventEmitter.immediately('afterRegist',init,vueState.pageStatus.afterRegist)
        })
        onUnmounted(()=>{
            window.AdSDK.removeEventListener('ad_show',adShow)
        })
        return {
            rulesModalData,
            quickWithdrawModalData,
            rewardsModalData,
            propsList,
            vueState,
            Request,
            listEventData
        }
    }
}
</script>
<style lang="less" scoped>
.deep-events{
    padding-top: .24rem;
    
    &>.header{
        height: 2.88rem;
        background:url(./assets/images/bg.png) no-repeat;
        background-position: 0 .55rem;
        background-size: 2.12rem 1.82rem;
        background-color: #333953;
        .title{
            text-align: center;
            font-size: .26rem;
            font-weight: bold;
            font-family: DIN Black, DIN Black-Regular;
            color: white;
            &>p{
                line-height: .3rem;
                &>span{
                    color: #00AD56;
                }
            }
        }
        .sub-title{
            margin-top: .08rem;
            font-size: .16rem;
            font-weight: bold;
            color: rgba(255,255,255,0.6);
            line-height: .2rem;
            text-align: center;
        }
        .tips{
            // display: inline-block;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-top: .04rem;
            &-content{
                line-height: .14rem;
                font-size: .12rem;
                color: #aab3d1;;
                padding: .08rem;
                background: linear-gradient(90deg,rgba(255,255,255,0.00) 0%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.00) 100%);
            }
        }
        .button-wrapper{
            display: flex;
            align-items:center;
            justify-content: space-between;
            margin-top: .1rem;
        }
        .aside-button{
            font-size: .12rem;
            font-weight: bold;
            border: .01rem solid rgba(255,255,255,0.68);
            color: rgba(255,255,255,0.68);
            text-align: center;
            background-color: #172041;
            &:first-of-type{
                padding: .04rem .08rem .04rem .06rem;
                border-radius: 0 .16rem .16rem 0;
            }
            &:nth-last-of-type(1){
                font-size: .14rem;
                padding: .06rem .06rem .06rem .08rem;
                border-radius: .16rem 0px 0px .16rem;
            }
        }
    }
    &>.main{
        background-color: #F5F5F9;
        
        display: table-cell;
        .mgt{
            margin-top: -.7rem;
        }
        
    }
}
</style>