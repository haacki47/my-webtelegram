import React from 'react'
import { Autocomplete, Box, FormControl, TextField } from '@mui/material'
import { useFormikContext } from 'formik'

export function Country({ countries }) {
    const { setFieldValue, touched, errors, values, handleChange } =
        useFormikContext()

    const renderOption = (props, { country_code, name }) => {
        return (
            <Box
                component="li"
                sx={{
                    '& > img': {
                        mr: 2,
                        flexShrink: 0,
                    },
                }}
                {...props}
            >
                <img
                    loading="lazy"
                    width="20"
                    src={`https://flagcdn.com/w20/${country_code.toLowerCase()}.png`}
                    srcSet={`https://flagcdn.com/w40/${country_code.toLowerCase()}.png 2x`}
                    alt=""
                />
                {country_code} {name}
            </Box>
        )
    }

    const renderInput = (params) => {
        return (
            <TextField
                {...params}
                error={touched.countryCode && Boolean(errors.countryCode)}
                helperText={
                    errors.countryCode &&
                    touched.countryCode &&
                    errors.countryCode
                }
                value={values.countryCode}
                onChange={handleChange}
                name="countryCode"
                label="Country"
            />
        )
    }

    const handleOnChange = (_, option) => {
        if (!option) {
            setFieldValue('countryCode', '')
            return
        }

        const {
            calling_codes: [code],
        } = option

        setFieldValue('countryCode', code)
    }

    return (
        <FormControl margin="normal" fullWidth>
            <Autocomplete
                disablePortal
                options={countries}
                fullWidth
                getOptionLabel={(option) => option.name}
                onChange={handleOnChange}
                renderOption={renderOption}
                renderInput={renderInput}
            />
        </FormControl>
    )
}
