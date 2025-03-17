import { createI18n } from "vue-i18n";
// import { useMetaStore } from "./store/meta";
// const metaStore = useMetaStore();

export const i18n = createI18n({
    locale: "en-US",
    fallbackLocale: "en-US",
    messages: {
        "en-US": {
            home: {
                title: "WebRTC-based online screen sharing",
                share: "Sharing",
                receive: "Receive",
            },
            sidebar: {
                home: "Home",
                share: "Share",
                receive: "Receive",
                history: "History",
                settings: "Settings",
            },
            share: {
                title: "Sharing Panel",
                input: "Current UID",
                placeholder: "Share to get UID",
            },
            media: {
                title: "Media Capture Mode Configuration",
                screen: "Screen",
                camera: "Camera",
                audio: "Audio",
                microphone: "Microphone",
                mediaModeLabel: "Media Capture Mode",
                mediaModePlaceholder: "Please select the media capture mode",
                videoDeviceIdLabel: "Available Camera Devices",
                videoDeviceIdPlaceholder:
                    "Please select an available camera device",
                audioDeviceIdLabel: "Available Microphone Devices",
                audioDeviceIdPlaceholder:
                    "Please select an available microphone device",
            },
            mediaModeOptions: {
                0: "Screen + Audio + Microphone",
                1: "Screen + Microphone",
                2: "Screen + Audio",
                3: "Screen",
                4: "Camera + Audio + Microphone",
                5: "Camera + Microphone",
                6: "Camera + Audio",
                7: "Camera",
            },
            receive: {
                title: "Receive Panel",
                inputLabel: "Target UID",
                queryPlaceholder: "Click to check available target UID",
                noqueryPlaceholder: "Please enter the target UID",
                selectLabel: "Media Reception Mode",
                selectPlaceholder: "Please select media reception mode",
            },
            receiveModeOptions: {
                0: "Audio + Video",
                1: "Video Only ",
                2: "Audio Only",
            },
            settings: {
                title: "Settings Panel",
                autoRequireStreamEnable: "Enable automatic media reception",
                autoRequireStreamDisable: "Disable automatic media reception",
                autoRefetchEnable: "Enable reconnection after disconnection",
                autoRefetchDisable: "Disable reconnection after disconnection",
                autoTryPlayEnable: "Enable timed playback check",
                autoTryPlayDisable: "Disable timed playback check",
                queryEnable: "Enable UID Remote Database",
                queryDisable: "Disable UID Remote Database",
                remoteDatabaseTest: "Test remote database",
                remoteAPP_ID: "APP_ID (Only leanCloud is currently supported)",
                remoteAPP_KEY:
                    "APP_KEY (Only leanCloud is currently supported)",
                remoteSERVER_URL:
                    "SERVER_URL (Only leanCloud is currently supported)",
                timecheck:
                    "Global maximum timeout threshold for all network communications (ms)",
                peerSettingsTitle: "Peer Server Configuration",
                peerSelectLabel: "Peer Node Mode",
                peerSelectPlaceholder: "Please choose a peer node mode",
                serverURLInputLabel: "Server URL",
                serverURLInputExamplePlaceholder:
                    'Example "https://0.peerjs.com"',
                stunSettingsTitle: "STUN/TURN Server Configuration",
                stunSettingsShortTitle: "STUN/TURN Configuration",
                noServerTip: "😊 No STUN/TURN server",
                stunInputExamplePlaceholder:
                    'Example "turn:example.com^username:password"',
            },
            history: {
                titleAlwaysShow: "History",
                titleCanHide: "Panel",
                deleteWhatPC: "Delete Selected",
                deleteWhatPhone: "Delete All",
                noRecordsTip: "No history records 🤔",
                labelTime: "Time",
                labelAction: "Action",
                labelResult: "Result",
                actionShare: "Sharing",
                actionReceive: "Receive",
                resultSuccess: "Success",
                resultFail: "Fail",
                deleteRecordsTip:
                    "There will be one selected record to be deleted, are you sure? | There will be {count} selected records to be deleted, are you sure?",
            },
            toast: {
                sqlSuccess: "Connect to remote UID database successfully 👍",
                sqlFail: "Connect to remote UID database failed 😢",
                noDevicesAccess: "Browser does not support device access",
                noMediaDevicesFound: "No camera or microphone device found",
                mediaDevicesFailed: "Device access failed:",
                tipBothUse:
                    "Camera and system audio are used together, you need to manually share the system audio in the whole screen, but will not read the whole screen image information",
                badMediaStream: "Unable to get audio stream 😭",
                mediaErr: "Unable to capture media stream 😭",
                autoQueryUID: "Automatically query available target UID",
                timeoutCapture:
                    "Request timed out, unable to capture media stream 😭",
                addItemToDatabase: "Added to remote UID database",
                addItemToDatabaseFailed: "Failed to add to remote UID database",
                NotAllowedError: "Please allow the use of media devices 🎥",
                NoMethodError:
                    "The device does not support this WebRTC method 😥",
                NoSelectedError:
                    "You don't seem to have selected the equipment you need to use 🤔",
                noUIDToShare: "Please share the media to get UID",
                copySuccess: "Copy successfully: ",
                autoFetchUID: "Automatically query available target UID",
                noInitLeanCloud: "Please configure remote server information!",
                notHttpsWebRTC:
                    "Use HTTPS protocol for non-localhost environments to enable the WebRTC API",
                notHttpsClipboard:
                    "For non-localhost environments, please use the HTTPS protocol to enable the Clipboard API",
                noClipboard: "This device does not support the Clipboard API",
                tryRefetch: "The video stream was interrupted, try refetching",
                noQuery:
                    "Target UID is empty, try to query available target UIDs",
                emptyUID: "The target UID is empty",
                loadingErr: "The current page has not finished loading",
                timeoutErr:
                    "Request timed out and could not capture media stream 😭",
                badPeer:
                    "Could not connect to Peer node, please check Peer configuration",
                queryUIDSuccess: "Available UID Query Success",
                queryUIDFail: "Query Failed: No Available UID Found",
                queryDatabaseFail: "Failed to request UID database",
                noUID: "Target UID is null",
                noUIDAndQuery:
                    "Target UID is null, try querying for available target UIDs",
            },
        },
        "zh-CN": {
            home: {
                title: "基于 WebRTC 的在线屏幕共享",
                share: "媒体共享",
                receive: "媒体接收",
            },
            sidebar: {
                home: "主页",
                share: "共享",
                receive: "接收",
                history: "历史",
                settings: "设置",
            },
            share: {
                title: "媒体共享面板",
                input: "当前 UID",
                placeholder: "分享获取 UID",
            },
            media: {
                title: "媒体捕获模式配置",
                screen: "屏幕",
                camera: "摄像头",
                audio: "音频",
                microphone: "麦克风",
                mediaModeLabel: "媒体捕获模式",
                mediaModePlaceholder: "请选择媒体捕获模式",
                videoDeviceIdLabel: "可用摄像头设备",
                videoDeviceIdPlaceholder: "请选择可用摄像头设备",
                audioDeviceIdLabel: "可用麦克风设备",
                audioDeviceIdPlaceholder: "请选择可用麦克风设备",
            },
            mediaModeOptions: {
                0: "屏幕 + 音频 + 麦克风",
                1: "屏幕 + 麦克风",
                2: "屏幕 + 音频",
                3: "屏幕",
                4: "摄像头 + 音频 + 麦克风",
                5: "摄像头 + 麦克风",
                6: "摄像头 + 音频",
                7: "摄像头",
            },
            receive: {
                title: "媒体接收面板",
                inputLabel: "目标 UID",
                queryPlaceholder: "点击查询可用目标 UID",
                noqueryPlaceholder: "请输入目标 UID",
                selectLabel: "媒体接收模式",
                selectPlaceholder: "请选择媒体接收模式",
            },
            receiveModeOptions: {
                0: "音频 + 视频",
                1: "仅视频",
                2: "仅音频",
            },
            settings: {
                title: "设置面板",
                autoRequireStreamEnable: "启用自动媒体接收",
                autoRequireStreamDisable: "禁用自动媒体接收",
                autoRefetchEnable: "启用断开后重连",
                autoRefetchDisable: "禁用断开后重连",
                autoTryPlayEnable: "启用定时播放检查",
                autoTryPlayDisable: "禁用定时播放检查",
                queryEnable: "启用 UID 远程数据库",
                queryDisable: "禁用 UID 远程数据库",
                remoteDatabaseTest: "测试远程数据库",
                remoteAPP_ID: "APP_ID (目前仅支持 LeanCloud )",
                remoteAPP_KEY: "APP_KEY (目前仅支持 LeanCloud )",
                remoteSERVER_URL: "SERVER_URL (目前仅支持 LeanCloud )",
                timecheck: "所有网络通信的全局最大超时阈值 (ms)",
                peerSettingsTitle: "Peer 服务器配置",
                peerSelectLabel: "Peer 节点模式",
                peerSelectPlaceholder: "请选择 Peer 节点模式",
                serverURLInputLabel: "服务器 URL",
                serverURLInputExamplePlaceholder: '示例 "https://0.peerjs.com"',
                stunSettingsTitle: "STUN/TURN 服务器配置",
                stunSettingsShortTitle: "STUN/TURN 配置",
                noServerTip: "😊 无 STUN/TURN 服务器",
                stunInputExamplePlaceholder:
                    '示例 "turn:example.com^username:password"',
            },
            history: {
                titleAlwaysShow: "历史记录",
                titleCanHide: "面板",
                deleteWhatPC: "删除选中项",
                deleteWhatPhone: "删除全部项",
                noRecordsTip: "无历史记录 🤔",
                labelTime: "时间",
                labelAction: "操作",
                labelResult: "结果",
                actionShare: "共享",
                actionReceive: "接收",
                resultSuccess: "成功",
                resultFail: "失败",
                deleteRecordsTip:
                    "将删除一条选中记录，是否确认？ | 将删除 {count} 条选中记录，是否确认？",
            },
            toast: {
                sqlSuccess: "成功连接到远程 UID 数据库 👍",
                sqlFail: "连接到远程 UID 数据库失败 😢",
                noDevicesAccess: "浏览器不支持设备访问",
                noMediaDevicesFound: "未找到摄像头或麦克风设备",
                mediaDevicesFailed: "设备访问失败：",
                tipBothUse:
                    "摄像头和系统音频同时使用，您需要在全屏中手动共享系统音频，但不会读取全屏图像信息",
                badMediaStream: "无法获取音频流 😭",
                mediaErr: "无法获取媒体流 😭",
                autoQueryUID: "自动查询可用目标 UID",
                timeoutCapture: "请求超时，无法捕获媒体流 😭",
                addItemToDatabase: "已添加到远程 UID 数据库",
                addItemToDatabaseFailed: "添加到远程 UID 数据库失败",
                NotAllowedError: "请允许使用媒体设备 🎥",
                NoMethodError: "该设备不支持此 WebRTC 方法 😥",
                NoSelectedError: "您似乎没有选择需要使用的设备 🤔",
                noUIDToShare: "请共享媒体以获取 UID",
                copySuccess: "复制成功：",
                autoFetchUID: "自动查询可用目标 UID",
                noInitLeanCloud: "请配置远程服务器信息！",
                notHttpsWebRTC:
                    "非 localhost 环境请使用 HTTPS 协议，以启用 WebRTC API",
                notHttpsClipboard:
                    "非 localhost 环境请使用 HTTPS 协议，以启用 Clipboard API",
                noClipboard: "此设备不支持 Clipboard API",
                tryRefetch: "视频流中断, 尝试重新获取",
                noQuery: "目标 UID 为空，可尝试查询可用目标 UID",
                emptyUID: "目标 UID 为空",
                loadingErr: "当前页面未加载完成",
                timeoutErr: "请求超时，无法捕获媒体流 😭",
                badPeer: "无法连接到 Peer 节点，请检查 Peer 配置",
                queryUIDSuccess: "可用 UID 查询成功",
                queryUIDFail: "查询失败: 未找到可用 UID",
                queryDatabaseFail: "请求 UID 数据库失败",
                noUID: "目标 UID 为空",
                noUIDAndQuery: "目标 UID 为空，可尝试查询可用目标 UID",
            },
        },

        "ja-JP": {
            home: {
                title: "WebRT Cベースのオンライン画面共有",
                share: "メディア共有",
                receive: "メディア受信",
            },
            sidebar: {
                home: "ホームページ",
                share: "共有",
                receive: "受信",
                history: "履歴",
                settings: "設定",
            },
            share: {
                title: "メディア共有パネル",
                input: "現在の UID",
                placeholder: "共有して UID を取得",
            },
            media: {
                title: "メディアキャプチャモード設定",
                screen: "画面",
                camera: "カメラ",
                audio: "音声",
                microphone: "マイク",
                mediaModeLabel: "メディアキャプチャモード",
                mediaModePlaceholder:
                    "メディアキャプチャモードを選択してください",
                videoDeviceIdLabel: "利用可能なカメラデバイス",
                videoDeviceIdPlaceholder:
                    "利用可能なカメラデバイスを選択してください",
                audioDeviceIdLabel: "利用可能なマイクデバイス",
                audioDeviceIdPlaceholder:
                    "利用可能なマイクデバイスを選択してください",
            },
            mediaModeOptions: {
                "0": "画面 + 音声 + マイク",
                "1": "画面 + マイク",
                "2": "画面 + 音声",
                "3": "画面",
                "4": "カメラ + 音声 + マイク",
                "5": "カメラ + マイク",
                "6": "カメラ + 音声",
                "7": "カメラ",
            },
            receive: {
                title: "メディア受信パネル",
                inputLabel: "ターゲット UID",
                queryPlaceholder: "クリックして利用可能なターゲット UID を照会",
                noqueryPlaceholder: "ターゲット UID を入力してください",
                selectLabel: "メディア受信モード",
                selectPlaceholder: "メディア受信モードを選択してください",
            },
            receiveModeOptions: {
                "0": "音声 + ビデオ",
                "1": "ビデオのみ",
                "2": "音声のみ",
            },
            settings: {
                title: "設定パネル",
                autoRequireStreamEnable: "自動メディア受信を有効にする",
                autoRequireStreamDisable: "自動メディア受信を無効にする",
                autoRefetchEnable: "切断後に再接続を有効にする",
                autoRefetchDisable: "切断後に再接続を無効にする",
                autoTryPlayEnable: "定期的な再生チェックを有効にする",
                autoTryPlayDisable: "定期的な再生チェックを無効にする",
                queryEnable: "UIDリモートデータベースを有効にする",
                queryDisable: "UIDリモートデータベースを無効にする",
                remoteDatabaseTest: "リモートデータベースをテスト",
                remoteAPP_ID: "APP_ID（現在、LeanCloud のみサポート）",
                remoteAPP_KEY: "APP_KEY（現在、LeanCloud のみサポート）",
                remoteSERVER_URL: "SERVER_URL（現在、LeanCloud のみサポート）",
                timecheck:
                    "すべてのネットワーク通信のグローバル最大タイムアウト閾値（ms）",
                peerSettingsTitle: "Peer サーバー設定",
                peerSelectLabel: "Pee rノードモード",
                peerSelectPlaceholder: "Peer ノードモードを選択してください",
                serverURLInputLabel: "サーバー URL",
                serverURLInputExamplePlaceholder: '例："https://0.peerjs.com"',
                stunSettingsTitle: "STUN/TURN サーバー設定",
                stunSettingsShortTitle: "STUN/TURN 設定",
                noServerTip: " STUN/TURN サーバーなし",
                stunInputExamplePlaceholder:
                    '例："turn:example.com^username:password"',
            },
            history: {
                titleAlwaysShow: "履歴",
                titleCanHide: "パネル",
                deleteWhatPC: "選択した項目を削除",
                deleteWhatPhone: "すべての項目を削除",
                noRecordsTip: "履歴がありません ",
                labelTime: "時間",
                labelAction: "操作",
                labelResult: "結果",
                actionShare: "共有",
                actionReceive: "受信",
                resultSuccess: "成功",
                resultFail: "失敗",
                deleteRecordsTip:
                    "選択したレコードを1件削除します。よろしいですか？ | 選択したレコードを{count}件削除します。よろしいですか？",
            },
            toast: {
                sqlSuccess: "リモートUIDデータベースへの接続に成功しました ",
                sqlFail: "リモートUIDデータベースへの接続に失敗しました ",
                noDevicesAccess:
                    "ブラウザはデバイスアクセスをサポートしていません",
                noMediaDevicesFound:
                    "カメラまたはマイクデバイスが見つかりませんでした",
                mediaDevicesFailed: "デバイスアクセスに失敗しました：",
                tipBothUse:
                    "カメラとシステム音声が同時に使用されます。全画面でシステム音声を共有する必要がありますが、全画面の画像情報は読み取られません",
                badMediaStream: "音声ストリームを取得できません ",
                mediaErr: "メディアストリームを取得できません ",
                autoQueryUID: "利用可能なターゲットUIDを自動的に照会",
                timeoutCapture:
                    "リクエストがタイムアウトし、メディアストリームをキャプチャできません ",
                addItemToDatabase: "リモートUIDデータベースに追加されました",
                addItemToDatabaseFailed:
                    "リモートUIDデータベースへの追加に失敗しました",
                NotAllowedError: "メディアデバイスの使用を許可してください ",
                NoMethodError:
                    "このデバイスはこのWebRTCメソッドをサポートしていません ",
                NoSelectedError:
                    "使用する必要があるデバイスを選択していないようです ",
                noUIDToShare: "メディアを共有してUIDを取得してください",
                copySuccess: "コピーに成功しました：",
                autoFetchUID: "利用可能なターゲットUIDを自動的に照会",
                noInitLeanCloud: "リモートサーバー情報を設定してください！",
                notHttpsWebRTC:
                    "localhost環境以外では、HTTPSプロトコルを使用してWebRTC APIを有効にしてください",
                notHttpsClipboard:
                    "localhost環境以外では、HTTPSプロトコルを使用してClipboard APIを有効にしてください",
                noClipboard:
                    "このデバイスはClipboard APIをサポートしていません",
                tryRefetch:
                    "ビデオストリームが中断されました。再取得を試みます",
                noQuery:
                    "ターゲットUIDが空です。利用可能なターゲットUIDの照会を試みてください",
                emptyUID: "ターゲットUIDが空です",
                loadingErr: "現在のページは読み込みが完了していません",
                timeoutErr:
                    "リクエストがタイムアウトし、メディアストリームをキャプチャできません ",
                badPeer:
                    "Peerノードに接続できません。Peer設定を確認してください",
                queryUIDSuccess: "利用可能なUIDの照会に成功しました",
                queryUIDFail:
                    "照会に失敗しました：利用可能なUIDが見つかりませんでした",
                queryDatabaseFail:
                    "UIDデータベースへのリクエストに失敗しました",
                noUID: "ターゲットUIDが空です",
                noUIDAndQuery:
                    "ターゲットUIDが空です。利用可能なターゲットUIDの照会を試みてください",
            },
        },
    },
});

export const languages = [
    { value: "en-US", text: "English (US)" },
    { value: "zh-CN", text: "简体中文" },
    { value: "ja-JP", text: "日本語" },
];
