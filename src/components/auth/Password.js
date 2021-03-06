import React from 'react'
import { TextField } from '@mui/material'
import { useFormikContext } from 'formik'

export const Password = (props) => {
    const { values, errors, touched, handleChange } = useFormikContext()

    return (
        <TextField
            type="password"
            name="password"
            value={values.password}
            onChange={handleChange}
            label="Password"
            error={touched.password && Boolean(errors.password)}
            helperText={errors.password && touched.password && errors.password}
            placeholder="Login password"
        />
    )
}
