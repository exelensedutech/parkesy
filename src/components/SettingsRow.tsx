"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Avatar from "@mui/material/Avatar";
import Switch from "@mui/material/Switch";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { alpha } from "@mui/material/styles";

export function SettingsRow({
  icon,
  color,
  title,
  subtitle,
  onClick,
}: {
  icon: React.ReactNode;
  color: string;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <Card onClick={onClick} sx={{ cursor: "pointer" }}>
      <CardContent>
        <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
            <Avatar sx={{ bgcolor: alpha(color, 0.15), color, width: 40, height: 40 }}>{icon}</Avatar>
            <Box>
              <Typography variant="subtitle1">{title}</Typography>
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            </Box>
          </Stack>
          <ChevronRightIcon color="action" />
        </Stack>
      </CardContent>
    </Card>
  );
}

export function SettingsSwitchRow({
  icon,
  color,
  title,
  subtitle,
  checked,
  onChange,
}: {
  icon: React.ReactNode;
  color: string;
  title: string;
  subtitle: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <Card>
      <CardContent>
        <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
            <Avatar sx={{ bgcolor: alpha(color, 0.15), color, width: 40, height: 40 }}>{icon}</Avatar>
            <Box>
              <Typography variant="subtitle1">{title}</Typography>
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            </Box>
          </Stack>
          <Switch checked={checked} onChange={(e) => onChange(e.target.checked)} />
        </Stack>
      </CardContent>
    </Card>
  );
}
