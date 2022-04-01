import TDLibConstructor from 'tdweb';
import {Component} from 'react';
import './App.css';
import {Autocomplete, Button, FormControl, InputLabel, MenuItem, Select, TextField, Typography} from "@mui/material";

const TDLib =  new TDLibConstructor({instanceName: 'telegram_web', mode: 'wasm', isBackground: false});

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            phone: '',
            country: null,
            countries: [],
            authState: '',
            code: '',
        };
    }

    componentDidMount() {
        TDLib.onUpdate = this.onUpdate;
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevState.authState  == this.state.authState) {
            this.getContacts();
        }
    }

    async getContacts() {
        const {user_ids: userIds = []} = await TDLib.send({'@type': 'getContacts'});
    }

    onUpdate = async (update) => {
        const updateType = update['@type'];

        if (updateType === 'updateAuthorizationState') {
            const authState = update.authorization_state['@type'];

            this.setState({authState});

            console.log('AUTHSTATE', authState, update.authorization_state);

            if(authState === 'authorizationStateWaitTdlibParameters') {
                await this.onUpdateTdlibParameters();
            }

            if (authState === 'authorizationStateWaitEncryptionKey') {
                TDLib.send({'@type': 'checkDatabaseEncryptionKey'});
            }
        }
    };

    async onUpdateTdlibParameters() {
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
            }
        });

        const {countries} = await TDLib.send({'@type': 'getCountries'});

        this.setState({countries});
    }

    handlePhoneChange(phone) {
        this.setState({phone});
    }

    handleCountryChange({calling_codes: callingCodes, name}) {
        this.setState({country: name, phone: `+${callingCodes} `});
    }

    handleCodeChange(code) {
        this.setState({code});
    }

    handlePasswordChange(password) {
        this.setState({password});
    }

    onSetAuthenticationPhoneNumber() {
        const {phone} = this.state;

        TDLib.send({
            '@type': 'setAuthenticationPhoneNumber',
            phone_number: phone
        })
    }

    onCheckAuthenticationCode() {
        const {code} = this.state;

        TDLib.send({
            '@type': 'checkAuthenticationCode',
            code
        });
    }

    onCheckAuthenticationPassword() {
        const {password} = this.state;

        TDLib.send({
            '@type': 'checkAuthenticationPassword',
            password
        });
    }

    renderPhoneAuthorization() {
        const {phone, countries} = this.state;

        return (
            <>
                <FormControl className="auth-form-control" fullWidth>
                    <Autocomplete
                        disablePortal
                        options={countries}
                        onChange={(e, country) => this.handleCountryChange(country)}
                        getOptionLabel={({english_name: countryName}) => countryName}
                        renderOption={(props, {english_name: countryName, country_code: countryCode}) => (
                            <MenuItem {...props} value={countryCode}>
                                <Typography fontWeight="600" mr={2}>{countryCode}</Typography>
                                <span>{countryName}</span>
                            </MenuItem>
                        )}
                        renderInput={(params) => <TextField {...params} label="Country"  placeholder="Country" />}
                    />
                </FormControl>

                <FormControl className="auth-form-control" fullWidth>
                    <TextField value={phone}
                               label="Phone number"
                               onChange={(e) => this.handlePhoneChange(e.target.value)}
                    />
                </FormControl>

                <Button onClick={() => this.onSetAuthenticationPhoneNumber()} sx={{width: '100%', padding: '10px 0'}} className="auth-form-submit" variant="contained">NEXT</Button>
            </>
        );
    }

    renderAuthCode() {
        const {code} = this.state;
        return (
            <>
                <FormControl className="auth-form-control" fullWidth>
                    <TextField value={code}
                               onChange={(e) => this.handleCodeChange(e.target.value)}
                               label="Code"
                    />
                </FormControl>

                <Button onClick={() => this.onCheckAuthenticationCode()} sx={{width: '100%', padding: '10px 0'}} className="auth-form-submit" variant="contained">NEXT</Button>
            </>
        )
    }

    renderPasswordAuthentication() {
        const {password} = this.state;

        return (
            <>
                <FormControl className="auth-form-control" fullWidth>
                    <TextField value={password}
                               type="password"
                               onChange={(e) => this.handlePasswordChange(e.target.value)}
                               label="Password"
                    />
                </FormControl>

                <Button onClick={() => this.onCheckAuthenticationPassword()} sx={{width: '100%', padding: '10px 0'}} className="auth-form-submit" variant="contained">NEXT</Button>
            </>
        )
    }

    render() {
        const {authState} = this.state;
        const isAuthStateReady = authState === 'authorizationStateReady';

        let authenticationMethod = null;

        switch(authState) {
            case 'authorizationStateWaitPhoneNumber':
                authenticationMethod = this.renderPhoneAuthorization();
                break;
            case 'authorizationStateWaitCode':
                authenticationMethod = this.renderAuthCode();
                break;

            case 'authorizationStateWaitPassword':
                authenticationMethod = this.renderPasswordAuthentication();
                break;
        }

        return (
            <>
                {!isAuthStateReady && (
                    <form className="auth-form" autoComplete="off">
                        <img className="auth-form-logo" src="logo.svg"/>
                        <Typography variant="h4" align="center" mb={1}>Sign in to Telegram</Typography>
                        <Typography variant="body1" color="grey.600" align="center" mb={3}>Please confirm your country code
                            and enter your phone number.</Typography>
                        {authenticationMethod}
                    </form>
                )}
            </>
        )
    }
}

export default App;
