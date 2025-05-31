from telethon.sync import TelegramClient
from telethon import TelegramClient, errors, functions, types
import asyncio
from pathlib import Path
import logging
from telethon.tl.types import PeerUser, PeerChat, PeerChannel
from telethon.errors.rpcbaseerrors import BadRequestError
from telethon.sessions import StringSession
from dotenv import load_dotenv
import os
import sys

load_dotenv()
API_ID = int(os.getenv("API_ID"))
API_HASH = os.getenv("API_HASH")
PHONE = os.getenv("PHONE")
PASSW = os.getenv("PASSW")

if len(sys.argv) < 3:
    print("Не переданы аргументы: user_id и gift_name")
    sys.exit(1)

user_id = int(sys.argv[1])
gift_name = sys.argv[2]

logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)
ROOT = Path(__file__).resolve().parent
ex_f = ROOT / 'exclude.txt'


EXCLUDE = {l.strip() for l in ex_f.read_text(encoding='utf-8').splitlines()
           if ex_f.exists() and l.strip() and not l.lstrip().startswith('#')} if ex_f.exists() else set()


def key_of(gift: types.TypeStarGift) -> str:
    return f'https://t.me/nft/{gift.slug}' if getattr(gift, 'slug', None) else f'id:{gift.id}'


client = TelegramClient('my_session', API_ID, API_HASH)

async def login():
    await client.connect()
    if await client.is_user_authorized(): return
    if not PHONE: print('❌ PHONE needed'); sys.exit(1)
    await client.send_code_request(PHONE)
    code = input('Code: ').strip()
    try:
        await client.sign_in(PHONE, code)
    except errors.SessionPasswordNeededError:
        if not PASSW: print('❌ PASSWORD needed'); sys.exit(1)
        await client.sign_in(password=PASSW)
    if isinstance(client.session, StringSession):
        print('\nTG_SESSION_STRING:\n', client.session.save(), '\n')

async def send_star_gift_py(user_id: int, gift_name: str):
    try:
        await login() 
        saved: types.payments.SavedStarGifts = await client(
            functions.payments.GetSavedStarGiftsRequest(peer=types.InputPeerSelf(),
                                                        offset='', limit=100))
        dst = await client.get_input_entity(user_id)

        gifts = [g for g in saved.gifts
                if (isinstance(g.gift, types.StarGiftUnique) or getattr(g.gift, 'limited', False))
                and key_of(g.gift) not in EXCLUDE]
        if not gifts:
            return
        processed = set()
        for sg in gifts:
            if sg.gift.title == gift_name:
                if sg.msg_id in processed: continue
                processed.add(sg.msg_id)
                k = key_of(sg.gift)

                invoice = types.InputInvoiceStarGiftTransfer(
                    stargift=types.InputSavedStarGiftUser(msg_id=sg.msg_id),
                    to_id=dst
                )
                try:
                    form = await client(functions.payments.GetPaymentFormRequest(invoice=invoice))
                    price = sum(p.amount for p in form.invoice.prices)   # Stars
                    if price == 0:
                        raise BadRequestError(400, 'NO_PAYMENT_NEEDED', None)
                    #print(f'➡️  {k} → @{DEST_USERNAME}  (-{price} Stars)')
                    await client(functions.payments.SendStarsFormRequest(
                        form_id=form.form_id, invoice=invoice))
                    #print(f'✅ Done {k}')
                except BadRequestError as e:
                    if e.message == 'NO_PAYMENT_NEEDED':
                        try:
                            await client(functions.payments.TransferStarGiftRequest(
                                stargift=types.InputSavedStarGiftUser(msg_id=sg.msg_id),
                                to_id=dst
                            ))
                            #print(f'✅ Free-transfer {k}')
                        except BadRequestError as e2:
                            if e2.message in {'STARGIFT_NOT_UNIQUE', 'STARGIFT_USAGE_LIMITED'}:
                                print(f'⏩ Skip {k} ({e2.message})')
                            else:
                                raise
                    elif e.message in {'STARGIFT_NOT_UNIQUE', 'STARGIFT_USAGE_LIMITED'}:
                        #print(f'⏩ Skip {k} ({e.message})')
                        pass
                    else:
                        raise
            break

    except Exception as e:
        logger.error(f"Ошибка при переводе подарка: {e}")
    finally:
        await client.disconnect()



if __name__ == '__main__':
    async def main():
        await send_star_gift_py(user_id, gift_name)
    asyncio.run(main())