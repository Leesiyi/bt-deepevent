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
            <input id="quick-input" type="text" readonly>
            <div class="header">
                <div class="title">{{$t('Quick withdrawal instructions')}}</div>
            </div>
            <div class="main">
                <div class="content">{{$t('You have not completed this type of')}} <span>Bitcoin</span> {{$t('trading task, and you can automatically upgrade the VIP withdrawal channel after completion')}}.</div>
                <div class="content" style="margin-top:.12rem">{{$t("Cash out at any time, same day arrival")}}</div>
                <div class="content" style="margin-top:.12rem">{{$t('For assistance, please contact')}}</div>
                <div class="content" style="margin-top:.04rem;font-weight:bold" @click="copy">whatsapp: {{vueState.pageInfo.activityUser?.tel || '+8615928535376'}} ({{$t('copy')}})</div>
            </div>
        </div>
    </Popup>
</template>
<script>
import { Popup, Toast} from 'vant'
import { getCurrentInstance, inject } from 'vue'

export default {
    props: ['show','vueState'],
    components: { Popup },
    setup(props, ctx) {
        const vueState = props.vueState
        const {proxy} = getCurrentInstance()
        const submit = () => {
            ctx.emit('submit')
        }
        const close = () => {
            ctx.emit('update:show', false)
        }
        const copy = ()=>{
            const input = document.getElementById('quick-input')
            input.setAttribute('value', `${vueState.pageInfo.activityUser?.tel || '+8615928535376'}`);
            input.focus()
            input.setSelectionRange(0, -1)
            document.execCommand('copy')
            Toast(proxy.$t('Success'))
        }
        return {
            submit,
            close,
            copy
        }
    }
}
</script>
<style lang="less" scoped>
#quick-input{
    position: absolute;
    top: 0;
    left: 0;
    width: .1rem;
    opacity: 0;
}
.modal {
    &-container {
        width: 3.11rem;
        background:linear-gradient(180deg,#f6f7ff, #ffffff 100%);
        border-radius: .16rem;
        padding: .24rem 0 .7rem;
        position: relative;
        &::after{
            content: '';
            display: block;
            height: 1.15rem;
            width: 1.47rem;
            background: url(../assets/images/bg_modal_quick.png) no-repeat center;
            background-size: contain;
            position: absolute;
            left: 1.58rem;
            bottom: 0;
        }
        .header{
            .title {
                font-size: 0.18rem;
                font-weight: bold;
                color: #7E4CF8;
                display: flex;
                align-items: center;
                justify-content: center;
                & > span {
                    line-height: 0.28rem;
                    margin: 0 0.06rem;
                }
                &::before,
                &::after {
                    content: '';
                    display: block;
                    height: 0.2rem;
                    width: 0.2rem;
                    background-repeat: no-repeat;
                    background-position: center;
                    background-size: contain;
                }
                &::before {
                    background-image: url(../assets/images/icon_title.svg);
                    transform: rotateY(180deg);
                }
                &::after {
                    background-image: url(../assets/images/icon_title.svg);
                }
            }
        }
        .main{
            padding: 0 .2rem;
            margin-top: .2rem;
            .content{
                font-size: .12rem;
                line-height: .18rem;
                color:rgba(46,30,145,0.72);
                &>span{
                    color: #FF7152;
                }
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
