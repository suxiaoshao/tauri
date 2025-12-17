/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-04-29 22:08:21
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-05-01 02:45:51
 * @FilePath: /tauri/packages/ChatGPT/src/features/Template/Detail/components/View.tsx
 */
import assistant from '@chatgpt/assets/assistant.jpg';
import system from '@chatgpt/assets/system.png';
import user from '@chatgpt/assets/user.jpg';
import { Details, type DetailsItem } from '@chatgpt/components/Details';
import CustomMarkdown from '@chatgpt/components/Markdown';
import { Avatar, AvatarImage } from '@chatgpt/components/ui/avatar';
import { Item, ItemContent, ItemGroup, ItemMedia, ItemSeparator, ItemTitle } from '@chatgpt/components/ui/item';
import { Separator } from '@chatgpt/components/ui/separator';
import type { AdapterInputs } from '@chatgpt/types/adapter';
import { Role } from '@chatgpt/types/common';
import { type ConversationTemplate } from '@chatgpt/types/conversationTemplate';
import { getRoleKey } from '@chatgpt/utils/getRoleKey';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'time';
import { match } from 'ts-pattern';

export interface TemplateDetailViewProps {
  data: ConversationTemplate;
  inputs: AdapterInputs;
}
export default function TemplateDetailView({ data, inputs }: TemplateDetailViewProps) {
  const { t } = useTranslation();
  const items = useMemo<DetailsItem[]>(
    () => [
      { label: t('name'), value: data.name },
      { label: t('icon'), value: data.icon },
      { label: t('mode'), value: data.mode },
      ...inputs.inputs.map(
        (input) =>
          ({
            label: input.name,
            value: data.template?.[input.id] as React.ReactNode,
          }) as DetailsItem,
      ),
      { label: t('created_at'), value: format(data.createdTime) },
      { label: t('updated_at'), value: format(data.updatedTime) },
      { label: t('description'), value: data.description, span: 3 },
    ],
    [data, inputs, t],
  );
  return (
    <div className="flex-[1_1_0] overflow-y-auto">
      <h6 className="ml-4 mt-4 text-xl leading-snug font-medium">{t('base_information')}</h6>
      <Details className="p-4" items={items} />
      <Separator className="my-4" />
      <h6 className="ml-4 mt-4 text-xl leading-snug font-medium">{t('prompts')}</h6>
      <ItemGroup>
        {data.prompts.map((prompt, index) => {
          const avatar = match(prompt.role)
            .with(Role.user, () => user)
            .with(Role.assistant, () => assistant)
            .with(Role.developer, () => system)
            .otherwise(() => user);
          return (
            // eslint-disable-next-line label-has-associated-control
            <React.Fragment key={prompt.prompt}>
              <Item className="items-start">
                <ItemMedia>
                  <Avatar>
                    <AvatarImage src={avatar} />
                  </Avatar>
                </ItemMedia>
                <ItemContent className="gap-1">
                  <ItemTitle>{t(getRoleKey(prompt.role))}</ItemTitle>
                  <CustomMarkdown value={prompt.prompt} />
                </ItemContent>
              </Item>
              {index !== data.prompts.length - 1 && <ItemSeparator />}
            </React.Fragment>
          );
        })}
      </ItemGroup>
    </div>
  );
}
