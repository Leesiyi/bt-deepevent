<template>
    <div class="task-list">
        <div v-if="localList.lenght === 0" class="task-list-empty">
            <div class="title">{{$t('Sorry')}}</div>
            <div class="content">{{$t('The current device has downloaded the')}}</div>
            <div class="content"><span>{{$t('relevant task APP')}}</span></div>
            <div class="content">{{$t('To participate in the event, switch phones or invite friends to complete tasks and earn commissions')}}</div>
        </div>
        <div v-else>
            
                <div v-for="(item,index) in localList" :key="item.offerId" :class="['task-list-item',{'mgt-0':index === 0},{'time-over':item.windowTimeOver}]">
                    <div v-if="item.taskThreshold && (item.taskThreshold > item.taskCompleted)" class="lock" @click="clickLock(item)">
                        <div>
                            <div class="icon"></div>
                            <div class="text">{{$t('Complete')}} <span>{{item.taskThreshold - item.taskCompleted}}</span> {{$t('tasks to unlock')}}</div>
                        </div>
                    </div>
                    <div class="header">
                        <div class="icon">
                            <img-component :src="item.icon"/>
                        </div>
                        <div>
                            <div class="title">{{item.title}}</div>
                            <div class="sub-title">{{item.brief}}</div>
                        </div>
                    </div>
                    <div class="main">
                        <div v-if="item.description" class="content" v-html="item.description"></div>
                    </div>
                    <div class="footer">
                        <div :class="['button-group',`${item.localState}`,{'window-time':item.lookback && item.localState === 'going'}]">
                            <div :class="['button-left',`${vueState.pageInfo.lang}`]" @click="clickTask(item)">{{stateText(item)}}
                                <div v-if="item.lookback && item.localState === 'going'" class="count-down">
                                    <span>{{('Only')}}</span><div class="icon"></div><count-down :time="(item.lookback * 1000) - new Date(new Date().toUTCString()).getTime()" @finish="windowTimeOver(item)"/><span>&nbsp;{{$t('left to')}}</span>
                                </div>
                                <div v-if="item.localState !== 'completed'" class="arrow"></div>
                            </div>
                            <div class="button-right" @click="clickWithdraw(item)">{{$t('Withdrawal')}}</div>
                        </div>
                    </div>
                </div>
            </div>
            
        
    </div>
</template>
<script>
import ImgComponent from '../ImageComponent/index.vue'
import { CountDown } from 'vant';
import { computed, getCurrentInstance } from 'vue';

export default {
    components:{
        ImgComponent,
        CountDown
    },
    props:{
        list:{
            default:[]
        },
        vueState:{},
    },
    setup(props,ctx) {
        const vueState = props.vueState
        const {proxy} = getCurrentInstance()
        const localList = computed(()=>{
            return props.list
        })
        const stateText = (item)=> {
            switch (item.localState) {
                case 'start':
                    return `${proxy.$t('Start get')} ${vueState.countryInfo.currencySymbol || '₹'}${(item.totalCoin / (vueState.pageInfo.rate || 100)).toFixed(2)}`
                case 'going':
                    return `${proxy.$t('Get')} ${vueState.countryInfo.currencySymbol || '₹'}${(item.totalCoin / (vueState.pageInfo.rate || 100)).toFixed(2)}`
                case 'done':
                    return `${proxy.$t('Reward get')} ${vueState.countryInfo.currencySymbol || '₹'}${(item.totalCoin / (vueState.pageInfo.rate || 100)).toFixed(2)}`
                case 'completed':
                    return `${proxy.$t('Completed')}`
                default:
                    break;
            }
        }
        const windowTimeOver = (item)=> {
            ctx.emit('windowTimeOver',item)
        }
        const clickLock = (item)=> {
            console.log('lock');
            ctx.emit('clickLock',item)
        }
        const clickTask = (item)=> {
            ctx.emit('clickTask',item)
        }
        const clickWithdraw = (item)=> {
            ctx.emit('clickWithdraw',item)
        }
        return {
            localList,
            vueState,
            stateText,
            clickWithdraw,
            clickTask,
            windowTimeOver,
            clickLock
        }
    }
}
</script>
<style lang="less" scoped>
.task-list{
    padding: 0 .12rem .2rem;
    &-empty{
        margin: 0 .1rem;
        padding: 1.74rem .16rem .24rem;
        background: url(../../assets/images/bg_empty.svg) no-repeat;
        background-position:center .16rem;
        background-size: 1.5rem 1.5rem;
        background-color: white;
        border-radius: .16rem;
        .title{
            font-size: .24rem;
            font-weight: bold;
            line-height: .32rem;
            text-align: center;
            color: #FF6778;
            margin-bottom: .08rem;
        }
        .content{
            text-align: center;
            font-size: .14rem;
            line-height: .22rem;
            color: #5C5C66;
            &>span{
                color: #FF8F2E;
            }
        }
    }
    &-item{
        // content-visibility: auto;
        padding: .12rem .12rem .16rem;
        background: #ffffff;
        border-radius: .16rem;
        box-shadow: 0px .04rem .22rem 0px rgba(5,43,27,0.12);
        margin-top: .28rem;
        position: relative;
        &.mgt-0{
            margin-top: 0;
        }
        &.time-over{
            display: none;
        }
        .lock{
            z-index: 3;
            position: absolute;
            display: block;
            left: 0;
            top: 0;
            height: 100%;
            width: 100%;
            background: rgba(0,0,0,0.72);
            border-radius: .16rem;
            display: flex;
            align-items: center;
            justify-content: center;
            .icon{
                height: .48rem;
                width: .48rem;
                background: url(../../assets/images/icon_lock.svg) no-repeat center;
                background-size: contain;
                margin: 0 auto;
            }
            .text{
                margin-top: .08rem;
                font-size: .18rem;
                font-family: Noto Sans, Noto Sans-Bold;
                font-weight: 700;
                line-height: .28rem;
                color: white;
                text-align: center;
                &>span{
                    color: #FFCE46;
                }
            }
        }
        .header{
            display: flex;
            .icon{
                height: .48rem;
                width: .48rem;
                border-radius: .08rem;
                margin-right: .08rem;
                flex-shrink: 0;
            }
            .title{
                font-size: .16rem;
                font-family: Noto Sans, Noto Sans-Bold;
                font-weight: 700;
                line-height: .24rem;
                color: #242433;
                display: -webkit-box;
                -webkit-box-orient: vertical;
                -webkit-line-clamp: 2;
                overflow: hidden;
            }
            .sub-title{
                font-size: .14rem;
                font-family: Noto Sans, Noto Sans-Regular;
                font-weight: 400;
                color: #5c5c66;
                line-height: .22rem;
            }
        }
        .main{
            margin-top: .16rem;
            .content{
                padding: .08rem;
                background: rgba(0,173,86,0.04);
                border-radius: .08rem;
                font-size: .14rem;
                color: #5c5c66;
                line-height: .22rem;
            }
        }
        .footer{
            margin-top: .16rem;
            .button-group{
                font-size: .16rem;
                font-family: Noto Sans, Noto Sans-Bold;
                font-weight: 700;
                display: flex;
                align-items: center;
                justify-content: space-between;
                white-space: nowrap;

                &.window-time{
                    padding-top: .2rem;
                }
                &.done{
                    .button-left{
                        border-color: #F99F02;
                        color: #F99F02;
                        .arrow{
                            background-image: url(../../assets/images/icon_arrow_yellow.svg);
                        }
                    }
                }
                &.completed{
                    .button-left{
                        border-color: #C3C3C3;
                        color: #C3C3C3;
                    }
                    .button-right{
                        background-color: #F99F02;
                        color: white;
                    }
                }
                &>div{
                    border-radius: .22rem;
                    height: .4rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .button-left{
                    width: 57.4%;
                    border: .02rem solid #00af66;
                    color: #00AF66;
                    position: relative;
                    &.pt{
                        font-size: .14rem;
                    }
                    .count-down{
                        position: absolute;
                        left: 50%;
                        top: -.02rem;
                        transform: translate(-50%,-100%);
                        padding: .04rem .06rem;
                        background: #00af66;
                        border-radius: .12rem .12rem 0 0;
                        box-shadow: 0px .04rem .22rem 0px rgba(5,43,27,0.12);
                        color: white;
                        font-size: .1rem;
                        font-weight: normal;
                        display: flex;
                        align-items: center;
                        justify-items: center;
                        &>span{
                            white-space: nowrap;
                        }
                        // min-width: 0;
                        .icon{
                            height: .14rem;
                            width: .14rem;
                            background: url(../../assets/images/icon_clock.svg) no-repeat center;
                            background-size: contain;
                            margin: 0 .02rem;
                            flex-shrink: 0;
                        }
                        .van-count-down{
                            color: white;
                            font-size: .12rem;
                            line-height: .12rem;
                        }
                    }
                    .arrow{
                        height: .16rem;
                        width: .16rem;
                        margin-left: .02rem;
                        background: url(../../assets/images/icon_arrow.svg) no-repeat center;
                        background-size: contain;
                    }
                }
                .button-right{
                    width: 40.8%;
                    background-color: #C3C3C3;
                    color: #FFFFFF;
                }
            }
        }
    }
}
</style>