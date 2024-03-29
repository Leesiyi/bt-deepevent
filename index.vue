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
import { inject, reactive, toRefs,onMounted, computed, onUnmounted, getCurrentInstance, nextTick } from 'vue'
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
import mockData from './assets/json/data.json'
export default {
    components:{TaskList,rulesModal,quickWithdrawModal,rewardsModal},
    props:{
        Request:{},
        vueState:{}
    },
    setup(props) {
        // console.log(eval('((type)=>{return `123 ${type} 213123`})(12312)'));
        // eval(`((type)=>{return `123 ${type} 213123`})(12312)`)
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
            initTimes:0,        //init执行次数
            isSdk2:/^http/.test(window.location.href),      //是否为sdk2.0
            loaded:false        //获取服务端数据完成
        })
        console.log('isSdk2',state.isSdk2);
        const rulesModalData = reactive({
            show:false
        })
        const quickWithdrawModalData = reactive({
            show:false
        })
        const rewardsModalData = reactive({
            show:false,
            coin:0,
            iconCoin:computed(()=>{     //不同app的金币icon
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
                        if(item.landingPage){
                            track(item.trackingURL)
                            openBrowser(item.landingPage)
                        }else{
                            openBrowser(item.trackingURL)
                        }
                        break;
                    case 'going':
                        openBrowser(item.landingPage ? item.landingPage : item.trackingURL)
                    case 'done':
                        const rewardStage = item.stages.find(item=>item.state === 'done')
                        Toast.loading({duration:0})
                        try{
                            await GetTaskRewards({
                                taskId:item.offerId,
                                stageId:rewardStage.stageId
                            })
                            rewardsModalData.coin = rewardStage.coin
                            rewardsModalData.show = true
                            Toast.clear()
                        }catch(e){
                            setTimeout(()=>{Toast.clear()},3000)
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
            windowTimeOver:(item)=>{        //窗口期倒计时结束，隐藏任务
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
            console.log(state.loaded ? 'taskList' : 'cacheList',state.taskList,state.cacheList,new Date().getTime());
            return state.loaded ? state.taskList : state.cacheList      //首先显示本地缓存任务，服务端数据获取成功显示服务端数据
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
        /**
         * @description: getCache:获取本地缓存
         * @param {}
         * @return:void
         */
        const getCache = ()=> {
            state.idList = JSON.parse(localStorage.getItem('app_task_id_list') || '[]')     //获取本地任务id列表
            state.isFirst = !Boolean(localStorage.getItem('app_task_id_list'))      //判断是否为第一次进入
            state.idList && state.idList.length && state.idList.forEach((item)=>{       //获取本地缓存任务
                state.cacheList.push(JSON.parse(localStorage.getItem(item)))
            })
            console.log('getCache',state.cacheList,state.idList);
        }
        /**
         * @description: getData:获取服务端数据
         * @param {}
         * @return:void
         */
        const getData = async()=> {
            Toast.loading({duration:0})
            try{
                const task = await GetTask({
                    bundle:vueState.bundle,
                    extension:vueState.pageInfo.channel || '',
                    bundleList:['BTC'],
                    options:{noCompleted:true}
                })
                Toast.clear()
                state.taskList = task
                // state.taskList = mockData
                state.loaded = true
            }catch(e){
                setTimeout(()=>{Toast.clear()},3000)
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
                    localState,     //任务状态
                    localTs:new Date().getTime(),       //更新时间戳
                    totalCoin:item.stages.reduce((total,currentVal)=>{      //任务总金币
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
                if(list[i].state === 'done'){       //如果有一个阶段任务状态为done则整个任务为done
                    return 'done'
                }
                if(list[i].state === 'completed'){
                    completed++
                }
                if(list[i].state === 'get'){
                    undone++
                }
            }
            if(completed === length){       //阶段任务状态全部completed，整个任务状态为completed
                return 'completed'
            }
            if(undone === length){      //阶段任务状态全部为‘’，整个任务状态为start
                return 'start'
            }else{
                return 'going'      //阶段任务存在‘’和completed，任务状态为going
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
            console.log('setCache',state.idList);
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
                    console.log('new task');
                    //存入id列表
                    state.idList.push(item.offerId)
                }
            })
            // console.log(state.taskList,state.idList,state.newIdList);
            state.idList.forEach((item,index)=>{
                if(state.newIdList.indexOf(item) === -1){       //新id列表没有，本地缓存存在的任务
                    let task = JSON.parse(localStorage.getItem(item) || '{}')       //缓存中获取任务
                    if(task.localState === 'completed' && new Date().getTime()-task.localTs < 259200000){       //如果任务状态为‘completed’且缓存时间小于3天，存入已完成任务列表
                        console.log('cache completed');
                        state.completedList.push(task)
                        state.newIdList.push(item)
                        console.log(state.completedList);
                    }else if(task.localState === 'completed' && new Date().getTime()-task.localTs >= 259200000){   //如果任务状态为‘completed’且缓存时间大于等于3天删除本地缓存
                        
                        localStorage.removeItem(item)
                        state.idList.splice(index,1)
                        console.log('delete completed',state,item,index);
                    }else{     //其余情况存入更新状态列表，刷新任务状态
                        state.offersList.push({channel:task.bundleId,offerId:task.offerId})
                        state.unUpdateIdList.push(task.offerId)
                        console.log('update status');
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
                const task = JSON.parse(localStorage.getItem(item.campaign) || '{}')        //获取本地缓存任务
                const isShow = state.newIdList.indexOf(item.campaign) === -1 ? false : true     //是否已经存入任务列表
                const index = task.stages.findIndex((el)=>{return el.stageId === item.stageId})     //服务端返回任务状态不为‘’的阶段
                if(index !== -1 && task.stages[index].state !== item.status){       //是否是更新的任务
                    task.stages[index].state = item.status      //更新阶段状态
                    task.localState = setState(task.stages)     //更新任务状态
                    task.localTs = new Date().getTime()     //更新任务时间戳
                    localStorage.setItem(item.campaign,JSON.stringify(task))        //更新本地缓存
                    if(!isShow){
                        if(task.localState === 'completed'){        //更新后状态已完成，存入已完成列表
                            state.completedList.push(task)
                        }else{
                            state.taskList.push(task)       //如果不在任务列表，则存入
                        }
                        state.newIdList.push(item.campaign)
                    }
                    state.unUpdateIdList.indexOf(item.campaign) > -1 && state.unUpdateIdList.splice(state.unUpdateIdList.indexOf(item.campaign))        //从未更新列表删除
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
            console.log('unUpdateIdList',state.unUpdateIdList);
            state.unUpdateIdList.length && state.unUpdateIdList.forEach((item)=>{
                const task = JSON.parse(localStorage.getItem(item))
                if(task.localState === 'done' && new Date().getTime()-task.localTs < 5184000000){     //如果任务状态为done且缓存时间小于60天，返回任务
                    state.taskList.push(task)
                    state.newIdList.push(item)
                    console.log('cache done');
                }else if(new Date().getTime() - task.localTs >= 259200000){       //未更新状态列表内任务缓存时间是否大于三天，大于则删除
                    localStorage.removeItem(item)   
                    state.idList.splice(state.idList.indexOf(item),1)
                    console.log('remove',state,item);
                }else if(task.localState === 'going' && state.newIdList.indexOf(item) === -1){      //未更新状态列表缓存时间小于3天的going状态任务，存入任务列表
                    console.log('cache going');
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
            state.taskList = state.taskList.concat(state.completedList)
            state.completedList = []
            console.log('concatCompletedTask');
        }
        /**
         * @description: init:初始化
         * @param {}
         * @return:void
         */
        const init = async()=>{
            getCache()
            await getData()
            setData()
            console.log(state.isFirst);
            state.isFirst ? setCache() : filterCache()
            state.offersList.length && await getStatus()
            updateStatus()
            updateCache()
            concatCompletedTask()
            state.initTimes++
            state.cacheList = []
            state.newIdList = []
            console.log('init',state);
        }
        // !state.isSdk2 && getCache()
        onMounted(() => {
            window.AdSDK.addEventListener('ad_show',adShow)
            vueState.EventEmitter.immediately('afterRegist',()=>{initProxyLocalStorage(init)},vueState.pageStatus.afterRegist)
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