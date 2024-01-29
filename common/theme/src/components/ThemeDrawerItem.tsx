import { Palette } from '@mui/icons-material';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Radio,
  RadioGroup,
  TextField,
} from '@mui/material';
import { useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { ThemeSliceType, updateColor, useAppDispatch, useAppSelector } from '../themeSlice';
import { string, object, regex, picklist } from 'valibot';
import { valibotResolver } from '@hookform/resolvers/valibot';

const createColorSchema = object({
  color: string([regex(/^#(?:[0-9a-fA-F]{3}){1,2}$/, 'Invalid color format')]),
  colorSetting: picklist(['light', 'dark', 'system']),
});

export default function ThemeDrawerItem() {
  // 控制 dialog
  const [open, setOpen] = useState(false);
  const handleClose = () => {
    setOpen(false);
  };
  type FormData = Pick<ThemeSliceType, 'colorSetting' | 'color'>;
  const theme = useAppSelector((state) => state.theme);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: theme,
    resolver: valibotResolver(createColorSchema),
  });
  const dispatch = useAppDispatch();
  const onSubmit: SubmitHandler<FormData> = async ({ color, colorSetting }) => {
    await dispatch(updateColor({ colorSetting, color }));
    handleClose();
  };

  return (
    <>
      <ListItemButton onClick={() => setOpen(true)}>
        <ListItemIcon>
          <Palette />
        </ListItemIcon>
        <ListItemText>主题设置</ListItemText>
      </ListItemButton>
      <Dialog PaperProps={{ sx: { maxWidth: 700 } }} open={open} onClose={handleClose}>
        <Box sx={{ width: 500 }} onSubmit={handleSubmit(onSubmit)} component="form">
          <DialogTitle>主题设置</DialogTitle>
          <DialogContent>
            <FormControl error={errors.colorSetting && true}>
              <FormLabel id="color-setting">选择模式</FormLabel>
              <Controller
                name="colorSetting"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <RadioGroup
                    row
                    aria-labelledby="color-setting"
                    {...field}
                    onChange={(event, newValue) => {
                      field.onChange(newValue as 'dark' | 'light' | 'system');
                    }}
                  >
                    <FormControlLabel value="light" control={<Radio />} label="亮色" />
                    <FormControlLabel value="dark" control={<Radio />} label="暗色" />
                    <FormControlLabel value="system" control={<Radio />} label="跟随系统" />
                  </RadioGroup>
                )}
              />

              <FormHelperText id="color-setting">{errors.colorSetting?.message}</FormHelperText>
            </FormControl>
            <TextField
              error={errors.color && true}
              helperText={errors.color?.message}
              label="主题色"
              variant="standard"
              fullWidth
              {...register('color', { required: true })}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>取消</Button>
            <Button type="submit">提交</Button>
          </DialogActions>
        </Box>
      </Dialog>
    </>
  );
}
