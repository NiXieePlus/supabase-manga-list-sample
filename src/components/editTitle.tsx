import { Dialog, Disclosure, Transition } from "@headlessui/react";
import { ChevronUpIcon } from "@heroicons/react/solid";
import { Button, IconEdit, IconSave, IconTrash2, IconX } from "@supabase/ui";
import { useRouter } from "next/router";
import { Fragment, useCallback, useState } from "react";
import { Title } from "src/components/titleList";
import { client } from "src/libs/supabase";

type Props = {
  title: Title;
  getSubtitleList: VoidFunction;
};

export const EditTitle = (props: Props) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [title, setTitle] = useState<string>(props.title.title);
  const [author, setAuthor] = useState<string>(props.title.author);

  const router = useRouter();

  const openModal = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleSave = useCallback(async () => {
    if (title == "") {
      alert("Input title.");
      return;
    }
    const { error } = await client.from("manga_title").upsert([
      {
        id: props.title.id,
        user_id: props.title.user_id,
        title: title,
        author: author,
        image_url: props.title.image_url,
      },
    ]);
    if (error) {
      alert(error);
    } else {
      props.getSubtitleList();
      closeModal();
    }
  }, [title, props, author, closeModal]);

  const handleRemove = useCallback(async () => {
    let { error } = await client
      .from("manga_subtitle")
      .delete()
      .eq("title_id", props.title.id);
    if (error) {
      alert(error);
    }
    ({ error } = await client
      .from("manga_title")
      .delete()
      .eq("id", props.title.id));
    if (error) {
      alert(error);
    }
    router.push("/");
  }, [props, router]);

  return (
    <>
      <Button block size="medium" icon={<IconEdit />} onClick={openModal}>
        EDIT
      </Button>

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
                  Add Title
                </Dialog.Title>
                <div className="grid grid-cols-4 gap-2 mt-4">
                  <div className="col-span-1 text-xl text-center">Title</div>
                  <input
                    className="w-full h-10 col-span-3 p-2 bg-white border border-gray-300 rounded shadow appearance-none hover:border-gray-700"
                    value={title}
                    onChange={(e) => {
                      return setTitle(e.target.value);
                    }}
                  />
                </div>
                <div className="grid grid-cols-4 gap-2 mt-4">
                  <div className="col-span-1 text-xl text-center">Author</div>
                  <input
                    className="w-full h-10 col-span-3 p-2 bg-white border border-gray-300 rounded shadow appearance-none hover:border-gray-700"
                    value={author}
                    onChange={(e) => {
                      return setAuthor(e.target.value);
                    }}
                  />
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
