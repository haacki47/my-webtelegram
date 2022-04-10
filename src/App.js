import TDLibConstructor from 'tdweb'
import { Component } from 'react'
import './App.css'
import {
    Avatar,
    Divider,
    List,
    ListItem,
    ListItemAvatar,
    ListItemButton,
    ListItemText,
    Typography,
} from '@mui/material'
import { DefaultAuthForm } from './components/auth/DefaultAuthForm'
import { ERROR_CODES } from './constants'
import { messages } from './messages_en'

const TDLib = new TDLibConstructor({
    instanceName: 'telegram_web',
    mode: 'wasm',
    isBackground: false,
})

class App extends Component {
    constructor(props) {
        super(props)

        this.state = {
            countries: [],
            authState: '',
        }
    }

    componentDidMount() {
        TDLib.onUpdate = this.onUpdate
    }

    onUpdate = async (update) => {
        const updateType = update['@type']

        if (updateType === 'updateAuthorizationState') {
            const authState = update.authorization_state['@type']

            this.setState({ authState })

            console.log('AUTHSTATE', authState, update.authorization_state)

            if (authState === 'authorizationStateWaitTdlibParameters') {
                await this.sendTdlibParameters()
            }

            if (authState === 'authorizationStateWaitEncryptionKey') {
                TDLib.send({ '@type': 'checkDatabaseEncryptionKey' })
            }
        }
    }

    async sendTdlibParameters() {
        await TDLib.send({
            '@type': 'setTdlibParameters',
            parameters: {
                '@type': 'tdParameters',
                api_id: process.env.REACT_APP_ID,
                api_hash: process.env.REACT_APP_HASH,
                system_language_code: navigator.language,
                device_model: 'Chrome',
                system_version: 'Mac/iOS',
                application_version: '0.1.0',
                database_directory: '/db',
                files_directory: '/',
                use_test_dc: false,
                use_secret_chats: false,
                use_message_database: true,
                use_file_database: false,
            },
        }).then(() => this.retrieveCountries())
    }

    async retrieveCountries() {
        const { countries } = await TDLib.send({ '@type': 'getCountries' })

        this.setState({ countries })
    }

    async sendPhoneNumber(values, { setErrors }) {
        const { phoneNumber, countryCode } = values

        try {
            await TDLib.send({
                '@type': 'setAuthenticationPhoneNumber',
                phone_number: `${countryCode}${phoneNumber}`,
            })
        } catch ({ message }) {
            if (message === ERROR_CODES.PHONE_NUMBER_INVALID) {
                setErrors({
                    phoneNumber: messages.errors.PHONE_NUMBER_INVALID,
                })
            }
        }
    }

    sendConfirmationCode({ code }) {
        TDLib.send({
            '@type': 'checkAuthenticationCode',
            code,
        })
    }

    async sendPassword({ password }, { setErrors }) {
        try {
            TDLib.send({
                '@type': 'checkAuthenticationPassword',
                password,
            })
        } catch ({ message }) {
            if (message === ERROR_CODES.PASSWORD_HASH_INVALID) {
                setErrors({
                    password: messages.errors.PASSWORD_HASH_INVALID,
                })
            }
        }
    }

    render() {
        const { countries, authState } = this.state

        switch (authState) {
            case 'updateAuthorizationState':
            case 'authorizationStateWaitTdlibParameters':
            case 'authorizationStateWaitPhoneNumber':
            case 'authorizationStateWaitCode':
            case 'authorizationStateWaitPassword':
            case 'authorizationStateWaitEncryptionKey':
            case 'authorizationStateWaitRegistration':
                return (
                    <>
                        <div className="auth-form">
                            <img className="auth-form-logo" src="logo.svg" />
                            <Typography variant="h4" align="center" mb={1}>
                                {messages.auth.TITLE}
                            </Typography>
                            <Typography
                                variant="body1"
                                color="grey.600"
                                align="center"
                                mb={3}
                            >
                                {messages.auth.HELPER_TEXT}
                            </Typography>
                            <DefaultAuthForm
                                countries={countries}
                                onSendPhoneNumber={this.sendPhoneNumber}
                                onSendConfirmationCode={
                                    this.sendConfirmationCode
                                }
                                onSendPassword={this.sendPassword}
                                authState={authState}
                            />
                        </div>
                    </>
                )

            case 'authorizationStateReady':
                return (
                    <List
                        dense
                        sx={{
                            width: '100%',
                            maxWidth: 360,
                            bgcolor: 'background.paper',
                            cursor: 'pointer',
                        }}
                        aria-label="contacts"
                        disablePadding
                    >
                        <ListItem disablePadding>
                            <ListItemButton>
                                <ListItemAvatar>
                                    <Avatar
                                        sx={{ width: 50, height: 50 }}
                                        src="https://i.pravatar.cc/500"
                                    ></Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    primary="John Doe"
                                    secondary={
                                        <>
                                            <Typography
                                                component="span"
                                                variant="body2"
                                                color="text.secondary"
                                            >
                                                {/*  LAST MESSAGE  */}
                                            </Typography>
                                        </>
                                    }
                                />
                            </ListItemButton>
                        </ListItem>
                        {/*<Divider variant="inset" component="li" />*/}
                    </List>
                )
        }
    }
}

export default App
