import { Auth, Button, IconCornerDownLeft } from "@supabase/ui";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useCallback, useEffect, useState, VFC } from "react";
import { EditTitle } from "src/components/editTitle";
import { LayoutWrapper } from "src/components/layoutWrapper";
import { SubtitleList } from "src/components/subtitleList";
import { Title as TitleType } from "src/components/titleList";
import { client } from "src/libs/supabase";

export type subtitle = {
  id: number;
  user_id: string;
  title_id: number;
  volume: number;
  isbn: number;
  image_url: string;
  possession: boolean;
};

const getSubtitles = async (id: string) => {
  let { data, error } = await client
    .from("manga_title")
    .select("*")
    .eq("id", id);
  if (!error && data) {
    const title = data[0];
    ({ data, error } = await client
      .from("manga_subtitle")
      .select("*")
      .order("volume", { ascending: true })
      .eq("title_id", id));
    if (!error && data) {
      return { title: title, subtitles: data };
    } else {
      return { title: title, subtitles: null };
    }
  }
  return { title: null, subtitles: null };
};

const Title: VFC = () => {
  const Container = () => {
    const { user } = Auth.useUser();

    const [subtitles, setSubtitles] = useState<subtitle[]>([]);
    const [title, setTitle] = useState<TitleType>();

    const router = useRouter();

    let { id } = router.query;

    const getSubtitleList = useCallback(async () => {
      if (id) {
        const { title, subtitles } = await getSubtitles(id.toString());
        if (title) {
          setTitle(title);
        } else {
          router.push("/");
        }
        if (subtitles) {
          setSubtitles(subtitles);
        }
      }
    }, [id, router]);

    useEffect(() => {
      if (!id) {
        router.push("/");
      }
      getSubtitleList();
    }, [user, getSubtitleList, id, router]);

    if (user) {
      return (
        <div>
          <div className="flex justify-end gap-2 my-2 mr-2">
            {title && (
              <div className="w-24">
                <EditTitle title={title} getSubtitleList={getSubtitleList} />
              </div>
            )}
            <div className="w-24">
              <Link href="/" passHref>
                <Button block size="medium" icon={<IconCornerDownLeft />}>
                  BACK
                </Button>
              </Link>
            </div>
          </div>
          {title && (
            <>
              <h2 className="pb-4 text-4xl font-bold text-center">
                {title.title}
              </h2>
              <p className="pb-4 text-2xl font-semibold text-center">
                {title.author}
              </p>
            </>
          )}
          {title && (
            <SubtitleList
              subtitles={subtitles}
              title={title}
              uuid={user.id}
              getSubtitleList={getSubtitleList}
            />
          )}
        </div>
      );
    }
    return <div></div>;
  };

  return (
    <LayoutWrapper>
      <Auth.UserContextProvider supabaseClient={client}>
        <Container />
      </Auth.UserContextProvider>
    </LayoutWrapper>
  );
};

export default Title;
