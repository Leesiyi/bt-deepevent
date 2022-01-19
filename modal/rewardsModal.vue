
<template>
    <Popup
        class="modal-transparent"
        v-model:show="show"
        :close-on-click-overlay="false"
        teleport="body"
    >
        <div class="modal-close">
            <div class="icon" @click="close"></div>
        </div>
        <div class="modal-container">
            <div class="header">Congratulations</div>
            <div class="main">
                <div class="icon"></div>
                <div class="coin-num" :style="{backgroundImage:`url(${iconCoin})`}">+{{coin}}</div>
                <div class="button" @click="close">I know</div>
            </div>
        </div>
    </Popup>
</template>
<script>
import { Popup } from 'vant'
import { inject } from 'vue'
import defaultCoin from '../assets/images/icon_coin_yowin.svg'

export default {
    props: {
        show:{},
        coin:{},
        iconCoin:{
            default:defaultCoin
        }
    },
    components: { Popup },
    setup(props, ctx) {
        const submit = () => {
            ctx.emit('submit')
        }
        const close = () => {
            ctx.emit('update:show', false)
        }
        return {
            submit,
            close,
        }
    }
}
</script>
<style lang="less" scoped>

.modal {
    &-container {
        width: 2.91rem;
        .header{
            height: .8rem;
            background: url(../assets/images/bg_title_modal_reward.svg) no-repeat center;
            background-size: contain;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: .24rem;
            font-family: DIN Pro, DIN Pro-Black;
            font-weight: 900;
            color: #DAFFE1;
        }
        .main{
            padding: .08rem .16rem .28rem;
            background: linear-gradient(180deg, #E2FBEE, rgba(226,240,251,0) 100%);
            background-color: white;
            border-radius: 0px 0px .16rem .16rem;
            display: flex;
            flex-direction: column;
            align-items: center;
            .icon{
                height: 1.2rem;
                width: 1.2rem;
                background: url(../assets/images/img_reward.png) no-repeat center;
                background-size: contain;

            }
            .coin-num{
                background: url(../assets/images/icon_coin_yowin.svg) no-repeat left center;
                background-size: .3rem .3rem;
                padding-left: .34rem;
                font-size: .34rem;
                font-weight: bold;
                line-height: .42rem;
                color: #FF9900;
            }
            .button{
                margin-top: .16rem;
                display: flex;
                align-items: center;
                justify-content: center;
                width: 100%;
                height: .46rem;
                background-color:#00AF66;
                border-radius: .7rem;
                box-shadow: 0 .09rem .23rem -.07rem rgba(0,175,102,0.50); 
                color: white;
                font-size: .16rem;
            }
        }
    }
    &-close {
        display: flex;
        justify-content: flex-end;
        .icon {
            margin-bottom: 0.2rem;
            height: 0.32rem;
            width: 0.32rem;
            background: url(../assets/images/icon_close_modal.svg) no-repeat center;
            background-size: contain;
        }
    }
}
</style>
