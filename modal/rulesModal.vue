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
            <input id="rules-input" type="text" readonly>
            <div class="header">
                <div class="title">
                    <span>{{ $t('Description of the event') }}</span>
                </div>
            </div>
            <div class="main">
                <div class="content">{{$t('In order to allow the majority of users to earn more money every day to improve their lives, we have selected a number of world-famous Bitcoin trading tasks, which can automatically upgrade the VIP withdrawal channel to complete the task, withdraw cash at any time, and arrive on the same day')}}</div>
                <div class="content">{{$t('The conditions to participate in such tasks are as follows')}}</div>
                <div class="content">1.{{$t('Download and install for the first time and register')}}</div>
                <div class="content">2.{{$t('Complete the recharge/purchase within 7 days from downloading and installing')}}.</div>
                <div class="content">{{$t('Please confirm that the above two conditions are met to ensure that the reward can successfully reach')}}</div>
                <div class="content">{{$t('For assistance, please contact')}}</div>
                <div class="content" style="margin-top:0" @click="copy">whatsapp: {{vueState.pageInfo.activityUser?.tel || '+8615928535376'}} ({{$t('copy')}})</div>
            </div>
        </div>
    </Popup>
</template>
<script>
import { Popup,Toast } from 'vant'
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
            const input = document.getElementById('rules-input')
            input.setAttribute('value', `${vueState.pageInfo.activityUser?.tel || '+8615928535376'}`);
            input.focus()
            input.setSelectionRange(0, -1)
            document.execCommand('copy')
            Toast(proxy.$t('Success'))
        }
        return {
            submit,
            close,
            copy,
        }
    }
}
</script>
<style lang="less" scoped>
#rules-input{
    position: absolute;
    top: 0;
    left: 0;
    width: .1rem;
    opacity: 0;
}
.modal {
    &-container {
        width: 3.11rem;
        height: 3.73rem;
        background: linear-gradient(180deg, #fff3d5, #ffffff 100%);
        border-radius: 0.16rem;
        padding-top: 0.36rem;
        // overflow-y: auto;
        position: relative;
        .header {
            display: block;
            position: fixed;
            left: 50%;
            top: 0.44rem;
            transform: translate(-50%);
            width: 2.48rem;
            height: 0.44rem;
            background: url(../assets/images/img_title_rules_modal.png) no-repeat center;
            background-size: contain;
            display: flex;
            align-items: center;
            justify-content: center;
            .title {
                font-size: 0.14rem;
                font-weight: bold;
                color: #8f3f2e;
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
                    background-image: url(../assets/images/icon_title_before_modal.png);
                }
                &::after {
                    background-image: url(../assets/images/icon_title_after_modal.png);
                }
            }
        }
        &::after {
            position: fixed;
            bottom: 0;
            left: 0;
            content: '';
            display: block;
            width: 100%;
            height: 0.6rem;
            background: linear-gradient(180deg, rgba(255, 253, 248, 0), #fffdf8 100%, #fffdf8 100%);
            border-radius: 0 0 0.16rem 0.16rem;
            pointer-events: none;
        }
        .main {
            padding: 0.16rem 0.2rem 0.2rem;
            height: 100%;
            overflow-y: auto;
            &::-webkit-scrollbar {
                display: none;
            }
            & > div + div {
                margin-top: 0.08rem;
            }
            .title {
                font-size: 0.14rem;
                color: #91401e;
                line-height: 0.22rem;
            }
            .content {
                margin-top: 0.12rem;
                font-size: 0.12rem;
                color: rgba(145, 64, 30, 0.72);
                line-height: 0.18rem;
                & > span {
                    color: #91401e;
                    font-weight: bold;
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