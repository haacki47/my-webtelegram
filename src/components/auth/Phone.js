import React from 'react'
import {
    FormControl,
    InputAdornment,
    TextField,
    Typography,
} from '@mui/material'
import { useFormikContext } from 'formik'

export const Phone = (props) => {
    const { errors, touched, values, handleChange } = useFormikContext()

    return (
        <TextField
            label="Phone"
            name="phoneNumber"
            error={touched.phoneNumber && Boolean(errors.phoneNumber)}
            helperText={
                errors.phoneNumber && touched.phoneNumber && errors.phoneNumber
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
                                +{values.countryCode}
                            </Typography>
                        </InputAdornment>
                    ),
                }
            }
            value={values.phoneNumber}
            onChange={handleChange}
        />
    )
}
