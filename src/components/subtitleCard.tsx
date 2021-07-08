import { Dialog, Disclosure, Transition } from "@headlessui/react";
import { ChevronUpIcon } from "@heroicons/react/solid";
import { Button, IconSave, IconTrash2, IconX } from "@supabase/ui";
import Image from "next/image";
import noImage from "public/no_image.png";
import { Fragment, useCallback, useState } from "react";
import { Title } from "src/components/titleList";
import { client } from "src/libs/supabase";
import { subtitle } from "src/pages/title";

type Props = {
  subtitle: subtitle;
  title: Title;
  uuid: string;
  getSubtitleList: VoidFunction;
};

export const SubtitleCard = (props: Props) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [volume, setVolume] = useState<string>(
    props.subtitle.volume.toString()
  );
  const [isbn, setIsbn] = useState<string>(props.subtitle.isbn.toString());
  const [possession, setPossession] = useState<boolean>(
    props.subtitle.possession
  );

  const openModal = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  let color = "grayscale";
  if (props.subtitle.possession) {
    color = "grayscale-0";
  }

  const handleSetThumbnail = useCallback(async () => {
    let title = props.title;
    title.image_url = props.subtitle.image_url;
    const { error } = await client.from("manga_title").upsert(title);
    if (error) {
      alert(error);
    }
    closeModal();
  }, [props, closeModal]);

  const handleRemove = useCallback(async () => {
    const { error } = await client
      .from("manga_subtitle")
      .delete()
      .eq("id", props.subtitle.id);
    if (error) {
      alert(error);
    }
    props.getSubtitleList();
    closeModal();
  }, [props, closeModal]);

  const handleSave = useCallback(async () => {
    if (volume == "" || Number(volume) == NaN) {
      alert("Input volume as an integer.");
      return;
    }
    if (Number(volume) < 0 || Number(volume) % 1 != 0) {
      alert("Input volume as an integer.");
      return;
    }
    if (isbn == "") {
      alert("Input ISBN number.");
      return;
    }
    const res = await fetch("https://api.openbd.jp/v1/get?isbn=" + isbn);
    const openbd = await res.json();
    if (!openbd) {
      alert("Could not get the data from openBD.");
      return;
    }
    if (openbd[0] == null) {
      alert("Invalid ISBN number. Please check.");
      return;
    }
    const imageUrl = "https://cover.openbd.jp/" + isbn + ".jpg";
    const { error } = await client.from("manga_subtitle").upsert({
      id: props.subtitle.id,
      user_id: props.subtitle.user_id,
      title_id: props.subtitle.title_id,
      volume: Number(volume),
      isbn: isbn.replaceAll("-", ""),
      image_url: imageUrl,
      possession: possession,
    });
    if (error) {
      alert(error);
    }
    props.getSubtitleList();
    closeModal();
  }, [props, volume, isbn, possession, closeModal]);

  return (
    <>
      <div className="p-2 border cursor-pointer" onClick={openModal}>
        <div className={color}>
          <div className="flex justify-center">
            {props.subtitle.image_url ? (
              <Image
                src={props.subtitle.image_url}
                alt="thumbnail"
                width={126}
                height={200}
              />
            ) : (
              <Image src={noImage} alt="thumbnail" width={126} height={200} />
            )}
          </div>
        </div>
        <div className="mt-2 text-center">({props.subtitle.volume})</div>
      </div>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-10 overflow-y-auto"
          onClose={closeModal}
        >
          <div className="min-h-screen px-4 text-center border-2">
            <span
              className="inline-block h-screen align-middle"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform border border-gray-300 shadow-xl bg-gray-50 rounded-xl">
                <Dialog.Title
                  as="h3"
                  className="text-2xl font-medium leading-6 text-center text-gray-900"
                >
                  Add Subtitle
                </Dialog.Title>
                <div className="grid grid-cols-4 gap-2 mt-4">
                  <div className="col-span-1 pt-1 text-xl text-center">
                    Volume
                  </div>
                  <input
                    className="w-full h-10 col-span-3 p-2 bg-white border border-gray-300 rounded shadow appearance-none hover:border-gray-700"
                    value={volume}
                    onChange={(e) => {
                      return setVolume(e.target.value);
                    }}
                  />
                </div>
                <div className="grid grid-cols-4 gap-2 mt-4">
                  <div className="col-span-1 pt-1 text-xl text-center">
                    ISBN
                  </div>
                  <input
                    className="w-full h-10 col-span-3 p-2 bg-white border border-gray-300 rounded shadow appearance-none hover:border-gray-700"
                    value={isbn}
                    onChange={(e) => {
                      return setIsbn(e.target.value);
                    }}
                  />
                </div>
                <div className="grid grid-cols-5 gap-2 mt-4">
                  <div className="col-span-2 pt-1 text-xl text-center">
                    Possession
                  </div>
                  <div className="col-span-3 pt-2 pl-2">
                    <input
                      type="checkbox"
                      className="scale-150"
                      checked={possession}
                      onChange={() => setPossession(!possession)}
                    />
                  </div>
                </div>
                <div className="pt-4 mx-4">
                  <Button block size="medium" onClick={handleSetThumbnail}>
                    SET TO THUMBNAIL
                  </Button>
                </div>
                <div className="mx-4 mt-4 bg-blue-50">
                  <Disclosure>
                    {({ open }) => (
                      <>
                        <Disclosure.Button className="flex justify-between w-full px-4 py-2 text-sm font-medium text-left text-blue-500 bg-blue-100 rounded-lg hover:bg-blue-200 focus:outline-none focus-visible:ring focus-visible:ring-blue-500 focus-visible:ring-opacity-75">
                          <span>REMOVE THIS</span>
                          <ChevronUpIcon
                            className={`${
                              open ? "transform rotate-180" : ""
                            } w-5 h-5 text-blue-500`}
                          />
                        </Disclosure.Button>
                        <Disclosure.Panel className="p-4 text-gray-500 text-md">
                          <Button
                            block
                            onClick={handleRemove}
                            icon={<IconTrash2 />}
                          >
                            REMOVE
                          </Button>
                        </Disclosure.Panel>
                      </>
                    )}
                  </Disclosure>
                </div>
                <div className="flex justify-center mt-4">
                  <div className="w-32 p-2">
                    <Button
                      block
                      type="default"
                      size="large"
                      icon={<IconX />}
                      onClick={closeModal}
                    >
                      Cancel
                    </Button>
                  </div>
                  <div className="w-32 p-2">
                    <Button
                      block
                      size="large"
                      icon={<IconSave />}
                      onClick={handleSave}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};
