import TDLibConstructor from 'tdweb'
import { Component } from 'react'
import * as Yup from 'yup'
import { Formik } from 'formik'
import './App.css'
import {
    Autocomplete,
    Box,
    Button,
    FormControl,
    InputAdornment,
    MenuItem,
    TextField,
    Typography,
} from '@mui/material'
import { Country } from './components/auth/Country'

const TDLib = new TDLibConstructor({
    instanceName: 'telegram_web',
    mode: 'wasm',
    isBackground: false,
})

const validationSchema = Yup.object({
    countryCode: Yup.string().required('Country is required'),
    phoneNumber: Yup.string().required('Phone number is required'),
})

class App extends Component {
    constructor(props) {
        super(props)

        this.state = {
            countries: [],
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

    sendPhoneNumber(values) {
        const { phoneNumber, countryCode } = values

        TDLib.send({
            '@type': 'setAuthenticationPhoneNumber',
            phone_number: `${countryCode}${phoneNumber}`,
        })
    }

    sendConfirmationCode(code) {
        TDLib.send({
            '@type': 'checkAuthenticationCode',
            code,
        })
    }

    sendPassword(password) {
        TDLib.send({
            '@type': 'checkAuthenticationPassword',
            password,
        })
    }

    render() {
        const { countries } = this.state

        const initialValues = {
            countryCode: '',
            phoneNumber: '',
            code: '',
            password: '',
        }

        return (
            <>
                <div className="auth-form">
                    <img className="auth-form-logo" src="logo.svg" />
                    <Typography variant="h4" align="center" mb={1}>
                        Sign in to Telegram
                    </Typography>
                    <Typography
                        variant="body1"
                        color="grey.600"
                        align="center"
                        mb={3}
                    >
                        Please confirm your country code and enter your phone o
                        number.
                    </Typography>
                    <Formik
                        initialValues={initialValues}
                        validationSchema={validationSchema}
                        onSubmit={(values) => {
                            this.sendPhoneNumber(values)
                        }}
                    >
                        {({
                            handleSubmit,
                            values,
                            errors,
                            touched,
                            handleChange,
                        }) => (
                            <form onSubmit={handleSubmit} autoComplete="off">
                                <Country countries={countries} />
                                <FormControl margin="normal" fullWidth>
                                    <TextField
                                        label="Phone"
                                        name="phoneNumber"
                                        error={
                                            touched.phoneNumber &&
                                            Boolean(errors.phoneNumber)
                                        }
                                        helperText={
                                            errors.phoneNumber &&
                                            touched.phoneNumber &&
                                            errors.phoneNumber
                                        }
                                        InputProps={
                                            values.countryCode && {
                                                startAdornment: (
                                                    <InputAdornment position="end">
                                                        <Typography
                                                            color="text.primary"
                                                            variant="body1"
                                                            mr={1}
                                                        >
                                                            +
                                                            {values.countryCode}
                                                        </Typography>
                                                    </InputAdornment>
                                                ),
                                            }
                                        }
                                        value={values.phoneNumber}
                                        onChange={handleChange}
                                    />
                                </FormControl>

                                <FormControl fullWidth margin="normal">
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        fullWidth
                                    >
                                        NEXT
                                    </Button>
                                </FormControl>
                            </form>
                        )}
                    </Formik>
                </div>
            </>
        )
    }
}

export default App
