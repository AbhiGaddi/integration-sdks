import axios from "axios";
import { JWEHelper } from "../src/jwe/JWEHelper";
import { HCXIncomingRequest } from "../src/impl/HCXIncomingRequest";
import HcxOperations from "../src/utils/hcx_operations";

jest.mock("axios");
jest.mock("../src/jwe/JweHelper");

describe("HCXIncomingRequest", () => {
  let instance;
  const mockData = {
    participantCode: "testprovider1.swasthmock@swasth-hcx-staging",
    authBasePath:
      "http://staging-hcx.swasth.app/api/v0.8/participant/auth/token/generate",
    protocolBasePath: "https://staging-hcx.swasth.app/api/v0.8",
    encryptionPrivateKeyURL:
      "https://raw.githubusercontent.com/Swasth-Digital-Health-Foundation/hcx-platform/main/hcx-apis/src/test/resources/examples/x509-private-key.pem",
    username: "testprovider1@swasthmock.com",
    password: "Opensaber@123",
    igUrl: "https://ig.hcxprotocol.io/v0.7.1",
  };

  beforeEach(() => {
    instance = new HCXIncomingRequest(
      mockData.participantCode,
      mockData.authBasePath,
      mockData.protocolBasePath,
      mockData.encryptionPrivateKeyURL,
      mockData.username,
      mockData.password,
      mockData.igUrl
    );
  });

  it("should initialize properly", () => {
    expect(instance.participantCode).toBe(mockData.participantCode);
    expect(instance.authBasePath).toBe(mockData.authBasePath);
    expect(instance.protocolBasePath).toBe(mockData.protocolBasePath);
    expect(instance.encryptionPrivateKeyURL).toBe(
      mockData.encryptionPrivateKeyURL
    );
    expect(instance.username).toBe(mockData.username);
    expect(instance.password).toBe(mockData.password);
    expect(instance.igUrl).toBe(mockData.igUrl);
  });

  describe("process", () => {
    it("should get a certificate and decrypt the payload", async () => {
      const mockPayload = "eyJhbGciOiJSU0EtT0FFUCIsImVuYyI6IkEyNTZHQ00iLCJ4LWhjeC1hcGlfY2FsbF9pZCI6ImQ5MTM1NWJkLTgyODMtNDkzZC1iNGUyLTY1Mjk0ZmFkM2JlZSIsIngtaGN4LXRpbWVzdGFtcCI6IjIwMjMtMDgtMjJUMTA6NTI6MzguOTk3WiIsIngtaGN4LXdvcmtmbG93X2lkIjoiNjAzYzk0ZTEtMjMxMy00OWNlLTg2NzMtNThkZjU3MzFlOWRjIiwieC1oY3gtc2VuZGVyX2NvZGUiOiJ0ZXN0cHJvdmlkZXIxLnN3YXN0aG1vY2tAc3dhc3RoLWhjeC1zdGFnaW5nIiwieC1oY3gtcmVjaXBpZW50X2NvZGUiOiJ0ZXN0cGF5b3IxLnN3YXN0aG1vY2tAc3dhc3RoLWhjeC1zdGFnaW5nIiwieC1oY3gtY29ycmVsYXRpb25faWQiOiJiZmRlYTEyOC1iZmYxLTRjMzMtODY5Ni1hMDkzZDQwZTI2YzgiLCJraWQiOiJIaWJseW10VUl5dmVVOHA1Ujg2WXc1bDFVWHY0NklNRmIwcjI5MjBDVnR3In0.PTdjXK48cQzzUH0YNYzbp3TJ7nwtwwKcKJNIdnKxQLKfillZG85gYvepjHtk4xrwChE4xs0dCD5sCdK4Jx7WsUJKXitWXgaW1rvzgXp_7-bmP6Kv6y2Vcr55oLqdaLklqrH_6Q8rojxCrJacCwF3WjKV2xHd64p4W4p-m_D_0gLp2Ad0biXM11QlLL_AOUZmzV53knyyUaJDR-xy1vo0PBy7i_Woysw7liFL_O1l8kpm6OKW1M7PFayT4z_337lxsbwgteeX7X6zbPjcI3j6jMQWteAXTDb_ZsGQV64L5_Qq1q3GbPzHQPhpl9yMCVEL3hXpAMlH7MhM5Wan7nUuKA.l3V5whM54IQ_j8mU.e-IM_agRyx-lTYBZws8YQB13KpqjEkLjKfeUBmW3s4fmpux_uVNlRI9WS4-YqkHgDavQn39su8t5P-vsASrZ1VzwkLudMcLZATSHZzGs3CDNI_onweoQIEOLh58bsBOeZijg-H771aowZZL_QHLh_jhIA5PaEn5KoaQq94xxP0yHsAnNQBoLpfBHs3I9w2zd_fAShBiKzYZxmPtcWfkt2NsyZmDWgeiSUCpSDppgPNIhKVXyUQlNBxHVqCiUyWI7Dju21DoQBl5Rh9jS0YkkTpw_Rz5REgCtZnxHoheA5Ce8VXkxOkzRO7B6C3PH8svK8zvGEd3B3Kn-mnd8RH8ps1zNCHAqFGTBzqubGHwT0RNkrb8MPvizhFU4ztCWnmwtLgknuF7Xlc4tn020fO2G48Z-Ftt0y0nx2vNVduBTX0UI6f1zEhU8kC4ElDR0jatTf90iFbHfmZ7UQJgRNPqd47Kcs2nS9_Ua3WJK9CAWkfDMlfgaQynqtYubC9DvoLezqrIyNH78xLcWRWAWTpLRqwQ9AEstb7PQHy2FCMlwcr19wa7WEgBZf5OP8bc0co8e2ozEyltTX_fsYh5DMq-GLQ4tnMTQCw8QN2qkHr-gyx6EMxqQrQkR0s6KDF2Mn3OEHr0e873LHnkaJpNeMnW1XV13pvF7HdQynL7BMx1WdFleFj74beD6U4Tg2eBIOkyhdKJPurZr65OSuUWxyEQbkjVOJ_ntqs63hl8AtNWFYRtS_mJj9xb95PzkNvZhHKQCze-0MrAkthCMmkQKUCf87AZCiuXFgKX8c1yfzFJ0b5dPKjoA12yGYLBrlIo2-9lgg8yWTydsZvL19wE0IQ9a1L54ImwTHqnuHV7nWWwTs_sWWcgkQU_SjJe8H00422jU-P3Y8QzxbUy5cGmTMncHHmyWYUGrw-WFca1A7PRpNTBM-4Ra4a0j0pyUn72PIbswWFqKbH5njmxXqJ90EqD7tZ_MaUH9j2xbgLbKPPbPRLf8vZC7gbfS1tJvarL9zT_hK7msmqEiX0TP2GBG542ExYmAmMltRT9jUGABO2DVVEKwFn5Eg68oBLJNnKKumLLIHU5aVFNcUwn7T6VRbGh8OR7pSDcvzI5tfKD9uLyzxnszpJHlXGUEObfruCou_ZLjWO0O8v6BTPavfQtmFVzVhw6RE4GWpNwpGkACKEEHaVRCNDG9xMl91r_Q8AXdNegydzQAsxaRm8y3vP0vtbI_ithWFjwtEgUDgbb2entrOD6dlHrl-KaRgElYr0wYEuQvaFF0MafnTZ0UFRHGrWy_HvUcYYNVLkxnLTUuCfKA2ucbf_dwgEd4CDQM5LIbPruyY-FkwmsTYZecK26Ej9jIB3oQKQr0axvuM38cUwhvYAy7iK0FGeYqNPssReMIyVMEYWIDHJx_Ii8wwkm-vKj8H36N-OuWdKiQBPpkZzfJef4cUe2rEt4rwKOUXMH91SegskQhsfrt0sOVZ-6-ie5dbqbIs-cIFX75xgfzzAOB2NVPl-VyyjUO0ZC_EoHQnaq3T1MEAYIm51VEKmfD-hasAdzk_wuXUEMDbStlJkn_mwCcuG7jvyTHJPjLqJ7JCQdeTAc7tvecAHX3-N87FrZ65fVxNRdcNjXiGbIICR1_xYOoAvcHI9dWJ2YYUDASXFqEX1IMDcRxgXlXxBgFzRlr8EarPQshZEUsq7lVIM1r6rsjLiOzcEX4rKw3_E0dkCFlsZY5Cig7pNHY468c6SqPsfHuFY3pSVx8gd85O9Z0cSk4fYMouTlZsG2KDzdDu632J7E2ur9N-Hs_tG4ENYmZX39WJGzXXWXzeIPvnNPTojtrxj-myw4GpOB0AsZdjPEHDkM4vIjNzLnr7MZz9_x8PuPndaUmxX4Lazgj3axOSmaj6D5U1EYE8YHj6oEgmAMi6TukKwSYGJORkOSoZKazB6Zj73AI-K8lygNg_i-p3iLluZapJJQBl-nevIsepGPu2MSUchpuN0KuEHAW-d1tQRaNQvzMUOYlYKsUocxUtm5u36ygEW4zWBpXTOCKeULDzdoEopNe7HiVOVdcULC3aeIXt2MFLaKZ5-sa7YEpSvoDrcGz4_HidzLX188_5FEYnlVhaYVj2ODSacmv-yGjWWcTybv3q7DURSH0XR8H7hfdPQlShwOhHieboDZIpuWGQgFRnLYkVv39x0NmuoYoNUDCwyWh_IZ9L60tkLcVXoTbzXSynUa2tRmLL2n0lyuwOrQb9_k6qFCQnWjVFr7GN7kwhKmjVuQJ439ev4WYuUHbJIuSHmeyKjHL3di_HIT6EPmMmhDhb3ZKxNFo9yh6PIN8ixZQpzv7jRTKHT0FxbSM1-l4UEvrJBZsnGQ6IbTH2LP9b2caaLlLrzy7cZMrRERQNXW-0y-pWrl60EipzqmnHc334Jzn-DoahAbCWtHEpAeB383BOFxnDevM_p5DWS8qYXdNZi3EV0bxakDjwY5ZmYznA-HkiLmtMB4h_yh0MqsCg25t4YarFC-FLTGSeoHiBgXgQJPZ0ZOUuMsyDVNx_bun93qs2E9GOt9un4UpKOOQ2O7s7t8vDqq6tSyr3m52CyEJZhKCnwrOxPX_bGMU-WKAAetficxNBLhhaeGhiPfdWie1gzETVw0f7cZ1b8fOckw1pIq3xp50q9CfeokB2FRHZH8pYB8FEsEBMo7jPbmcj4AONQwE6mtYjdk4fZ0IXUii0pwpVvGVNjxajM_ipaFFYjvNZchl2yQzra9sApj-jV3wLJ_uds92YPJCNWBpEcVhgmkFlFNOE3HkHgj7mkTTnPoYoPrVXNWeDgXPAAck-JWsUm_BIs5Y0IrPcbKWhxmiOqyqt_ztd51v_LpL4EwKNKFWMmpzJTp2fXH5sAqnfrNhvCGU2y1I5XSdI2FSQHwoQ9JJ_UXJ3QGbAIMI8epBJW8DX8c0WfiVmTCKNLVSR9t93bKz88p3vlBwceT2Ss9NDw58rIU1k4LDQrc1r35hUrJXzdaVOxlPjipO6PlS0TgZr2M6kW2LmMmd0HdcNMs4ey6z1wtvs1UIUwfVzNq8TcruhIiZbt5x_cFUWknh05C7lVsJoN-1SwMgzxjGvF7QXGsAhO_V_PIn7o7S1NQdnRUZQEEhBe1p54Ch-pztE0fnSTTNzJ8KuQXZt2QpoiR44CQpYHkzHZapiWw-vDiFOqoTewaG3O-hiUtQjVEJxdmU6LZgAbtjBCzT3FBrCxudAJXwIetLOK15FZpTO59GKXXLtgAw7jpjcmhOyZlj2TNuIf1jUDnNX7ZLKuh-X0tR1jQCXjv5n2zKpUGknJaVtjfkin6-eH84DTMpPFAn-KUpkYijvnywGsj65dfzCaOSx6zJ-czW_jVXqn42h-vkmC6dXwi_moVw_npyOLlVMJaoHDYtQQahnQdwP47d7CvxQ0NOJbFi3kZ10Onqa8GI4HyKglr7K37W9My8FG6ZoKT3aIOFGcPHxbxE1ETDooHh9yzCqtMhhajWTT15WhLdw6-WBIzH78LL2Ez_DD8OOPwUmbY0WwUqLtKkKYEm1ngZXupuVkjeGNKFrWtpO_nW3HRvt3wg3AhxpEM2WhuJQs-29_4_dowEZlEIIJo-4L0H03E90SvARTZ4tjj8I5qq03rWYvNfiIIUT2ZOavsnpj6fzLB387OE39kNeg9hMX0gNVNufQq04k3OETcNsH5nobdG4eVSCsgeWnTESvo3sxUdRULn4-PZ_JehtddTl2Gx5TTnobQQlqOzpAY5AkJ01Y-HT4d71HrOM7r_hyMBMnPGEJxKSqSGmCRtxhzzIwIeXoo2lPVU3epyQdeCcajqiWCGeVi8my1VFx-EHFZRtnOIzq0I_F1iKWWbSxXRCaSOCLqR16eDSfbwTQTKW5KCGuSpiocfTvJb5vT7DysqRdJ9htGfyBphY65Ye4TtKL8Bq5TLK_Wr6a_0hk4D1oxlkOFjODiH-6UULE1w3SQlQcyJKrVxDwosJeGJ1PSGqxMT535G_qGRhh7s2WY4_fNAYLuRQDbsg6YKPN_qmXGxdtmWruE_we3uaLI7_q0SjrKSAZYpLlMrm225sAZsXyk07K97Efj5goCbXL8B_ask8NZHu9_uSSW1A9WX6mGPVe_VaBXc2l7SWczdcdK2lpSsMyGOD6lKhUD8JvAahz8p5BSBX7TO4LbrgTR736aEVY0w9Hvp6Aag63hoUE96HQqIFTifkzCkfR55Ax4hoZL5DfytIMn8m74abKfmqZSiFaZ7hhErejdixnKbxUMLB9eT5UrseXVVDb51H76zqWN9mRprFRHaymmEcoyalgewvFcY7lkeHu8YMmM_Xy7DG84SfuQUriKJiYG-u6VN_wLZC7N2V49jm0arFJRf3faYN9awWNhQJgccRiAhr3qSA5eqzpFBQV5qc6OgXNcA7P3cwPK5lqy4pF_pEy7rlccWQ1c0NJYzLpK5rZ_QXIlLr0zQlA2jXAbzC8_MorHHUJyPAcxuhN1raLLlDEKa_hCypK3P4JqL2O7hOtu4YjEb7y2w_3zzoZ5wAwVn7PBv_S0esOBFYHg97YgFVSpbEmVYRbv_15Pu7YOd4GYR7wlGjjPB4uBiuBqL0O9LDtcAM1MysfH_SHQkKBzXlWyl8-OBIC_ZMnaZ7A6LZKaZ-zJUTPrYjlQrcTAMf2V2owS4oudRQ8191DMCnE9dWYtBq857oRzFP-7mDqnFOD3T_Tp1GDHdxsWk3TMmm-bJoJPq95nV-ibOdLjQSSABE8w7DvNetbssgMkpyZsDJL-3R3smN4_UwzBNeMMGYn82FGwPL3VhkLSaiprjjo4AP8EnqZmKQdp1LFdYmyopWEh7AKW9KDZdQMC7Srxi_OjfrPkIY9ivxAzy9AhHF-PAk4kVEhguyX7-d4X_fpXXtx-Iz-NyxPC1yP72fr0GAg1_t0YumvfTZL27Bel5AHr2XWigowWgPmhwf_peFkE0isEATZZPrZlIDmqV7ARw9MYCan6vOb29bI_9a7xBnsaXixpTMcq2rbx_klq8FbX5jMNvyKlP_bhhyIWIdcv-aNmo5g3DLdvNmZd0pgCgk5qQyB3uC45DwBkdpvErQMH9r81ObIP9X6z7HKynKKOGWfaaiaspEjAskDBbbJ9Ggx5H8XZ-_meczqt9NtD5lDF_-08xf-xPHAIctDbauBHyiXNtr_sMnQ7zq0RtwD4--i_kdKIMYyy8LIYA7Qc0MZvC5H5aEiNvWDmb4dyPj3OzqlDB7glCcuC79gSYmJNHiuvMGnK5scixznX-VpKUum2F1yuznvzAyYUt4L9DTdR5Oy9rSh4Rm4t_TaFOnKfiC4UgcfospopkAn39J6bk0VYNfGo--lZJwMwqq0oE3tnEA8nSrZPbARspAMRGmuSWNq3lKoqqPX6brIF5QtyOGtsuwuyWB-Yyt0ksAR1wICpnZmXCXXO4gKXvcIAmeDTuC0VBF7nMxig9BlEtlsdakGvy8-JemqKMQVJUUvjjXMwy8h9nY1yYjSZN-IvZpwqREmMoE-9AvXHQC0P4AGeT-janSdDxF0QeSOb1L3mf1BX8w9KcAI4qKqChergZEzHyATsTpt3ig04LrxidvlwTdv2utvx5yZbdHvyIFbWDyLwpCEhgDQi17dT20jFU7jmOp6Y0ZvJeYZ5MYI8WFTiM8X3BOugUE4MnuoR3HyOW5i6WQ7pmRIqQRe1yqxZqk1LMmqI4rLZ5TpDQbLZtyJnRArxfnwOq4LCAFX6Yy97174vwRis6Ip2G9_oJS9OaTBT1e72UlXEvA2gOgvX2iBMMY5uiaq60ZJnvyzdR4kUFBkjDdHjoxPZLOyLP6rrt6VNKmxalCSYh5L3B4bH56cTzpY9jXs8UhG17XJupfIHrIGCc5wbq0sHjcvNouRamuB0Wcx9jBOmaWG5bFJbvDcQ5-bvveqrHL-RTY31ebreU8LwNYdy6r1j0NufulpJ4xAxZ0FGwXu08r4dvHglFIf3DpCGsagmx1z1sQen8qsH0weNUPKoAbN6SybtXbCahRVoWJ0P5BQUhQSMhHmy67N9z1fApRfHWJGntdMfON_EcJzAPrV8XavjVF0fFRDZPGb22q_dHhd0XvW2Ko7ySEAtUeDzOcKhBy1pFdXfXyz-Vi2YLwWKRvaM7T7lZCBI3Bh7wBapLLQGzTdFYJqs9BVTkN52JHkAKTvvhhOxMS2dLO49EvXgrsn-T4cjw-KHbhxA4Nl4PXrhw5vsV2NX-Fn-CFiKm4EPq5DJu3y6BvOqnITf82P63QXEoKNxsbRInTOis1R7GL9rT8WHYoyX4h4GOpr30ngcgVkXuR5DYqCK2ymv17S-3RWhktoL8DizvUuGuIIUJTfXTBLVh-91F9QM5eOz9TzwRISSORxXFT21dRPZSiE5BvJ3y2eQQSr-i7kyLhvxFeq-OsRuCcjtzVXVFPx120WOLHdPKVrFEx29tlaE5uXR0gKEtoXFf5-8yn72e2dlQ8qSgt-pHCMSX74ccKvMb3kSM78EO37DY4bf0hy_ueT6rYlQlyiUKP93B-vhuZdEiN-II5U0tbj9drH_ZzkOl1LG5V8taTNB_fSo93rSK3OaPs1zr2j7A7WbU1J-mwC2UO_cCDyim1dlCT9giMoGzVHTLR1tozK2U7VlAAuuWCHk5p_rqoANaVT43ivYLTy3-uEQcGVjM92YxmxYqGhAM3pOglP0Fy93F3ePGWnXmed1T6zOAVHG56uYdjDv2uJZAAFon9Rf7RJOsC4TG7M5mE9bvGL9bhLVNg10R4MNRV8ZjqCx_hZ3IFljpxQT4R3rYfC8FuDEPpbWPhi4FXCWF-jGj0bJplETWI0_GZQmuYhHbRBfQlsRgyKhIhKXyWgD3-MpNTxKg4YdQnLDMb_Bt2jJFxuhZ1daFEhVwBMCxBHbaMp735nAdb9NtpgV6R40P0F-z0nce8_D1W5YOv7_ktFrZNSBxqd1HTwV6TU6BKpUUZRnihc6QJJuF9igEz7tFccr4NqCvkhGuGJyRGARnexSBDefRLADQJD0cM1_S8UmtX59GDG9JHSPwb9os6Fm5TkpGC1w4X6llPN9LbYSSXD7jNJ0SC5vjwJA2BSvtYx10ys9-56oCG_BXRaDFMnwH0txwvub_kromnbi0r5CqKBynfjp5_Icj6y1IUUCZn86flmfJLiWYQxl8Vp66Cgag0RDFxeLjjK1XkVO1XWyM0VIf-FFg2J_4SIsVxVjLmQFhO7HUc13sukLxtiRh92lO3-XavvhdEMJeIcteEQq_H21ebpAUBSup9brJ-w0th-3i_u-gerP4YiYp-rBwBJDlw1AaFe0Ittnbo458JBPOa8r23O2dMv36Y-37QnbfXjVOQhVfTo4fWhDX1nJ96SoRKKO0gs2rCQpVxTWpsofEitfPWp8gpuPkYg6XF-6CqdxNmEKzQn-IPOnHq0cwdAvvK0HTFGkXJ5R0jopE-pQ65aFZfe3QHuXD8cs4L7M3Ud0Ubv-04BRzHHy9Oa8uJtS-26F-0Xab2_KzWGQAHEsg8gRlRgYP1ygLdZUOHHEd44mkGF1WxAYb5mdOUko5w1hYV1-DbyW6UK5ZiNCuHnVic6bgiEKeg7eYM_J1x5oPpU-7Z-uYyClYnzDr_NXdZ11x3B4AVHrlSWLufBL8RulkcQL5RH5ANIl4NBhyLFAHYavqCDS85pNU4FZ5Hzp4qeWbv-kZbCH7XPBYGdIWyNxq7A2I8W4UO57EVRy0-ial9GYl1vDfmwWFHz2_xjVWrBs_f-DTwQjKxESeqpzdPzSGJyNsA2fnoOBrvftsRis5AkTF53xMpg-fHrHl0Ij6xRvuybSwobOJ9SBX5vC9FwrmAPjJuIOFZuzg5ttk8FZqb5iucGNtrqPrb78ZTsukXhlJhAUH-ERQQPU49cQh1JvY930er1TYCWLpBCLaXDgzcjIW0oxXqUXuLkK17RZVp1V2aXe1kaUhjXEIho81IC5yKYichOZc6UbNu3T-haF_pcBloNqFg3jx-d8hf_FFLtqs2GOLvfILbVei4RI2MzKng-ey4E8vVgukrp8rKzbeT49dHmvUVjt369ig9Plot8fNb__1CmAZ4Glq9TVNronYCd0chnNCAYUPSmO-728jn_Dd14izZ3sg34UUAizJ_GfOQQ-oqJOKo6f-rSJYb3Keh0Gxli2KaUEffOMnGnbRNkE4kuUKX_PHBkYdR_NEqLkTf5pJusaGrBxY0IJprKgJHiW4PL_4Xmk7xsE8nt_4u0d4605wpHI4MNkeWYTPP4Iv-c9D58q4C5tEPe9YZvG8yGVMCLk_DfLmcpf6cL-6bY2NEteDwMsTojT9Yz7f5haxMpQGvR5_DZTK8xVW6TKvfB9Yzaq_SomtKUYdLe5d8KGU3rraCmaLYx8Z_EFkQhFkwKg2KBBzYrDeRNHQ9r61Y0it5LvORjCrru6t8svzq-LY8_IzbbWvVXV94pMXt3zRiqIASc_Pknf8tFFE7y0eimHLKxC-r_540r5Hr4OVtmlOD0z-sWRVgLHuLk05J0SCjbe2lTaENA.8dKRzVH66gaw5ZxMkfQNLw";
      const mockCert = "-----BEGIN PRIVATE KEY----- \n \
      MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCG+XLPYiCxrZq7 \n \
      1IX+w7uoDGxGI7qy7XaDbL3BJE33ju7rjdrP7wsAOWRvM8BIyWuRZZhl9xG+u7l/ \n\
      7OsZAzGoqI7p+32x+r9IJVzboLDajk6tp/NPg1csc7f2M5Bu6rkLEvrKLz3dgy3Q \n \
      928rMsD3rSmzBLelfKTo+aDXvCOiw1dMWsZZdkEpCTJxH39Nb2K4S59kO/R2GtSU \n \
      /QMLq65m34XcMZpDtatA1u1S8JdZNNeMCO+NuFKBzIfvXUCQ8jkf7h612+UP1AYh \n \
      oyCMFpzUZ9b7liQF9TYpX1Myr/tT75WKuRlkFlcALUrtVskL8KA0w6sA0nX5fORV \n \
      suVehVeDAgMBAAECggEAX1n1y5/M7PhxqWO3zYTFGzC7hMlU6XZsFOhLHRjio5Ks \n \
      ImgyPlbm9J+W3iA3JLR2c17MTKxAMvg3UbIzW5YwDLAXViC+aW90like8mEQzzVd \n \
      S7ysXG2ytcqCGUHQNStI0hP0a8T39XbodQl31ZKjU9VW8grRGe12Kse+4ukcW6yR \n \
      VES+CkyO5BQB+vs3voZavodRGsk/YSt00PtIrFPJgkDuyzzcybKJD9zeJk5W3OGV \n \
      K1z0on+NXKekRti5FBx/uEkT3+knkz7ZlTDNcyexyeiv7zSL/L6tcszV0Fe0g9vJ \n \
      ktqnenEyh4BgbqABPzQR++DaCgW5zsFiQuD0hMadoQKBgQC+rekgpBHsPnbjQ2Pt \n \
      og9cFzGY6LRGXxVcY7hKBtAZOKAKus5RmMi7Uv7aYJgtX2jt6QJMuE90JLEgdO2v \n \
      xYG5V7H6Tx+HqH7ftCGZq70A9jFBaba04QAp0r4TnD6v/LM+PGVT8FKtggp+o7gZ \n \
      qXYlSVFm6YzI37G08w43t2j2aQKBgQC1Nluxop8w6pmHxabaFXYomNckziBNMML5 \n \
      GjXW6b0xrzlnZo0p0lTuDtUy2xjaRWRYxb/1lu//LIrWqSGtzu+1mdmV2RbOd26P \n \
      ArKw0pYpXhKFu/W7r6n64/iCisoMJGWSRJVK9X3D4AjPaWOtE+jUTBLOk0lqPJP8 \n \
      K6yiCA6ZCwKBgDLtgDaXm7HdfSN1/Fqbzj5qc3TDsmKZQrtKZw5eg3Y5CYXUHwbs \n \
      J7DgmfD5m6uCsCPa+CJFl/MNWcGxeUpZFizKn16bg3BYMIrPMao5lGGNX9p4wbPN \n \
      5J1HDD1wnc2jULxupSGmLm7pLKRmVeWEvWl4C6XQ+ykrlesef82hzwcBAoGBAKGY \n \
      3v4y4jlSDCXaqadzWhJr8ffdZUrQwB46NGb5vADxnIRMHHh+G8TLL26RmcET/p93 \n \
      gW518oGg7BLvcpw3nOZaU4HgvQjT0qDvrAApW0V6oZPnAQUlarTU1Uk8kV9wma9t \n \
      P6E/+K5TPCgSeJPg3FFtoZvcFq0JZoKLRACepL3vAoGAMAUHmNHvDI+v0eyQjQxl \n \
      meAscuW0KVAQQR3OdwEwTwdFhp9Il7/mslN1DLBddhj6WtVKLXu85RIGY8I2NhMX \n \
      LFMgl+q+mvKMFmcTLSJb5bJHyMz/foenGA/3Yl50h9dJRFItApGuEJo/30cG+VmY \n \
      o2rjtEifktX4mDfbgLsNwsI= \n \
      -----END PRIVATE KEY-----";
      const mockDecryptedData = {
        header: {
            alg: 'RSA-OAEP',
            enc: 'A256GCM',
            'x-hcx-api_call_id': 'de87d8a8-b264-41bd-acdb-aecba1e31a7c',
            'x-hcx-timestamp': '2023-08-22T10:19:46.615Z',
            'x-hcx-workflow_id': '5398a695-ff02-4b8f-b968-457daa21b4aa',
            'x-hcx-sender_code': 'testprovider1.swasthmock@swasth-hcx-staging',
            'x-hcx-recipient_code': 'testpayor1.swasthmock@swasth-hcx-staging',
            'x-hcx-correlation_id': '7e79fc8e-59b5-48d9-97f5-0caf751d087b',
            kid: 'HiblymtUIyveU8p5R86Yw5l1UXv46IMFb0r2920CVtw'
          },
        payload: {
            resourceType: 'Bundle',
            id: '98aa81af-7a49-4159-a8ed-35e721d6ae74',
            meta: { lastUpdated: '2023-02-20T14:03:15.013+05:30', profile: [Array] },
            identifier: {
              system: 'https://www.tmh.in/bundle',
              value: '7ee7ee1a-fcad-49c3-8127-aa70c7a4dc0d'
            },
            type: 'collection',
            timestamp: '2023-02-20T14:03:15.013+05:30',
            entry: [ [Object], [Object], [Object], [Object], [Object] ]
          },
      };
      axios.get.mockResolvedValueOnce({ data: mockCert });
      JWEHelper.decrypt.mockResolvedValueOnce(mockDecryptedData);

      const result = await instance.process(mockPayload, "mockOperation");
      expect(axios.get).toHaveBeenCalledWith(mockData.encryptionPrivateKeyURL, {
        verify: false,
      });
      expect(JWEHelper.decrypt).toHaveBeenCalledWith({
        cert: mockCert,
        payload: mockPayload,
      });
      expect(result).toHaveProperty("HEADERS", mockDecryptedData.header);
      expect(result).toHaveProperty("PAYLOAD", mockDecryptedData.payload);
    });
    it("should handle an error during certificate fetch", async () => {
      axios.get.mockRejectedValueOnce(new Error("Failed to fetch certificate"));

      await expect(
        instance.process("eyJhbGciOiJSU0EtT0FFUCIsImVuYyI6IkEyNTZHQ00iLCJ4LWhjeC1hcGlfY2FsbF9pZCI6ImQ5MTM1NWJkLTgyODMtNDkzZC1iNGUyLTY1Mjk0ZmFkM2JlZSIsIngtaGN4LXRpbWVzdGFtcCI6IjIwMjMtMDgtMjJUMTA6NTI6MzguOTk3WiIsIngtaGN4LXdvcmtmbG93X2lkIjoiNjAzYzk0ZTEtMjMxMy00OWNlLTg2NzMtNThkZjU3MzFlOWRjIiwieC1oY3gtc2VuZGVyX2NvZGUiOiJ0ZXN0cHJvdmlkZXIxLnN3YXN0aG1vY2tAc3dhc3RoLWhjeC1zdGFnaW5nIiwieC1oY3gtcmVjaXBpZW50X2NvZGUiOiJ0ZXN0cGF5b3IxLnN3YXN0aG1vY2tAc3dhc3RoLWhjeC1zdGFnaW5nIiwieC1oY3gtY29ycmVsYXRpb25faWQiOiJiZmRlYTEyOC1iZmYxLTRjMzMtODY5Ni1hMDkzZDQwZTI2YzgiLCJraWQiOiJIaWJseW10VUl5dmVVOHA1Ujg2WXc1bDFVWHY0NklNRmIwcjI5MjBDVnR3In0.PTdjXK48cQzzUH0YNYzbp3TJ7nwtwwKcKJNIdnKxQLKfillZG85gYvepjHtk4xrwChE4xs0dCD5sCdK4Jx7WsUJKXitWXgaW1rvzgXp_7-bmP6Kv6y2Vcr55oLqdaLklqrH_6Q8rojxCrJacCwF3WjKV2xHd64p4W4p-m_D_0gLp2Ad0biXM11QlLL_AOUZmzV53knyyUaJDR-xy1vo0PBy7i_Woysw7liFL_O1l8kpm6OKW1M7PFayT4z_337lxsbwgteeX7X6zbPjcI3j6jMQWteAXTDb_ZsGQV64L5_Qq1q3GbPzHQPhpl9yMCVEL3hXpAMlH7MhM5Wan7nUuKA.l3V5whM54IQ_j8mU.e-IM_agRyx-lTYBZws8YQB13KpqjEkLjKfeUBmW3s4fmpux_uVNlRI9WS4-YqkHgDavQn39su8t5P-vsASrZ1VzwkLudMcLZATSHZzGs3CDNI_onweoQIEOLh58bsBOeZijg-H771aowZZL_QHLh_jhIA5PaEn5KoaQq94xxP0yHsAnNQBoLpfBHs3I9w2zd_fAShBiKzYZxmPtcWfkt2NsyZmDWgeiSUCpSDppgPNIhKVXyUQlNBxHVqCiUyWI7Dju21DoQBl5Rh9jS0YkkTpw_Rz5REgCtZnxHoheA5Ce8VXkxOkzRO7B6C3PH8svK8zvGEd3B3Kn-mnd8RH8ps1zNCHAqFGTBzqubGHwT0RNkrb8MPvizhFU4ztCWnmwtLgknuF7Xlc4tn020fO2G48Z-Ftt0y0nx2vNVduBTX0UI6f1zEhU8kC4ElDR0jatTf90iFbHfmZ7UQJgRNPqd47Kcs2nS9_Ua3WJK9CAWkfDMlfgaQynqtYubC9DvoLezqrIyNH78xLcWRWAWTpLRqwQ9AEstb7PQHy2FCMlwcr19wa7WEgBZf5OP8bc0co8e2ozEyltTX_fsYh5DMq-GLQ4tnMTQCw8QN2qkHr-gyx6EMxqQrQkR0s6KDF2Mn3OEHr0e873LHnkaJpNeMnW1XV13pvF7HdQynL7BMx1WdFleFj74beD6U4Tg2eBIOkyhdKJPurZr65OSuUWxyEQbkjVOJ_ntqs63hl8AtNWFYRtS_mJj9xb95PzkNvZhHKQCze-0MrAkthCMmkQKUCf87AZCiuXFgKX8c1yfzFJ0b5dPKjoA12yGYLBrlIo2-9lgg8yWTydsZvL19wE0IQ9a1L54ImwTHqnuHV7nWWwTs_sWWcgkQU_SjJe8H00422jU-P3Y8QzxbUy5cGmTMncHHmyWYUGrw-WFca1A7PRpNTBM-4Ra4a0j0pyUn72PIbswWFqKbH5njmxXqJ90EqD7tZ_MaUH9j2xbgLbKPPbPRLf8vZC7gbfS1tJvarL9zT_hK7msmqEiX0TP2GBG542ExYmAmMltRT9jUGABO2DVVEKwFn5Eg68oBLJNnKKumLLIHU5aVFNcUwn7T6VRbGh8OR7pSDcvzI5tfKD9uLyzxnszpJHlXGUEObfruCou_ZLjWO0O8v6BTPavfQtmFVzVhw6RE4GWpNwpGkACKEEHaVRCNDG9xMl91r_Q8AXdNegydzQAsxaRm8y3vP0vtbI_ithWFjwtEgUDgbb2entrOD6dlHrl-KaRgElYr0wYEuQvaFF0MafnTZ0UFRHGrWy_HvUcYYNVLkxnLTUuCfKA2ucbf_dwgEd4CDQM5LIbPruyY-FkwmsTYZecK26Ej9jIB3oQKQr0axvuM38cUwhvYAy7iK0FGeYqNPssReMIyVMEYWIDHJx_Ii8wwkm-vKj8H36N-OuWdKiQBPpkZzfJef4cUe2rEt4rwKOUXMH91SegskQhsfrt0sOVZ-6-ie5dbqbIs-cIFX75xgfzzAOB2NVPl-VyyjUO0ZC_EoHQnaq3T1MEAYIm51VEKmfD-hasAdzk_wuXUEMDbStlJkn_mwCcuG7jvyTHJPjLqJ7JCQdeTAc7tvecAHX3-N87FrZ65fVxNRdcNjXiGbIICR1_xYOoAvcHI9dWJ2YYUDASXFqEX1IMDcRxgXlXxBgFzRlr8EarPQshZEUsq7lVIM1r6rsjLiOzcEX4rKw3_E0dkCFlsZY5Cig7pNHY468c6SqPsfHuFY3pSVx8gd85O9Z0cSk4fYMouTlZsG2KDzdDu632J7E2ur9N-Hs_tG4ENYmZX39WJGzXXWXzeIPvnNPTojtrxj-myw4GpOB0AsZdjPEHDkM4vIjNzLnr7MZz9_x8PuPndaUmxX4Lazgj3axOSmaj6D5U1EYE8YHj6oEgmAMi6TukKwSYGJORkOSoZKazB6Zj73AI-K8lygNg_i-p3iLluZapJJQBl-nevIsepGPu2MSUchpuN0KuEHAW-d1tQRaNQvzMUOYlYKsUocxUtm5u36ygEW4zWBpXTOCKeULDzdoEopNe7HiVOVdcULC3aeIXt2MFLaKZ5-sa7YEpSvoDrcGz4_HidzLX188_5FEYnlVhaYVj2ODSacmv-yGjWWcTybv3q7DURSH0XR8H7hfdPQlShwOhHieboDZIpuWGQgFRnLYkVv39x0NmuoYoNUDCwyWh_IZ9L60tkLcVXoTbzXSynUa2tRmLL2n0lyuwOrQb9_k6qFCQnWjVFr7GN7kwhKmjVuQJ439ev4WYuUHbJIuSHmeyKjHL3di_HIT6EPmMmhDhb3ZKxNFo9yh6PIN8ixZQpzv7jRTKHT0FxbSM1-l4UEvrJBZsnGQ6IbTH2LP9b2caaLlLrzy7cZMrRERQNXW-0y-pWrl60EipzqmnHc334Jzn-DoahAbCWtHEpAeB383BOFxnDevM_p5DWS8qYXdNZi3EV0bxakDjwY5ZmYznA-HkiLmtMB4h_yh0MqsCg25t4YarFC-FLTGSeoHiBgXgQJPZ0ZOUuMsyDVNx_bun93qs2E9GOt9un4UpKOOQ2O7s7t8vDqq6tSyr3m52CyEJZhKCnwrOxPX_bGMU-WKAAetficxNBLhhaeGhiPfdWie1gzETVw0f7cZ1b8fOckw1pIq3xp50q9CfeokB2FRHZH8pYB8FEsEBMo7jPbmcj4AONQwE6mtYjdk4fZ0IXUii0pwpVvGVNjxajM_ipaFFYjvNZchl2yQzra9sApj-jV3wLJ_uds92YPJCNWBpEcVhgmkFlFNOE3HkHgj7mkTTnPoYoPrVXNWeDgXPAAck-JWsUm_BIs5Y0IrPcbKWhxmiOqyqt_ztd51v_LpL4EwKNKFWMmpzJTp2fXH5sAqnfrNhvCGU2y1I5XSdI2FSQHwoQ9JJ_UXJ3QGbAIMI8epBJW8DX8c0WfiVmTCKNLVSR9t93bKz88p3vlBwceT2Ss9NDw58rIU1k4LDQrc1r35hUrJXzdaVOxlPjipO6PlS0TgZr2M6kW2LmMmd0HdcNMs4ey6z1wtvs1UIUwfVzNq8TcruhIiZbt5x_cFUWknh05C7lVsJoN-1SwMgzxjGvF7QXGsAhO_V_PIn7o7S1NQdnRUZQEEhBe1p54Ch-pztE0fnSTTNzJ8KuQXZt2QpoiR44CQpYHkzHZapiWw-vDiFOqoTewaG3O-hiUtQjVEJxdmU6LZgAbtjBCzT3FBrCxudAJXwIetLOK15FZpTO59GKXXLtgAw7jpjcmhOyZlj2TNuIf1jUDnNX7ZLKuh-X0tR1jQCXjv5n2zKpUGknJaVtjfkin6-eH84DTMpPFAn-KUpkYijvnywGsj65dfzCaOSx6zJ-czW_jVXqn42h-vkmC6dXwi_moVw_npyOLlVMJaoHDYtQQahnQdwP47d7CvxQ0NOJbFi3kZ10Onqa8GI4HyKglr7K37W9My8FG6ZoKT3aIOFGcPHxbxE1ETDooHh9yzCqtMhhajWTT15WhLdw6-WBIzH78LL2Ez_DD8OOPwUmbY0WwUqLtKkKYEm1ngZXupuVkjeGNKFrWtpO_nW3HRvt3wg3AhxpEM2WhuJQs-29_4_dowEZlEIIJo-4L0H03E90SvARTZ4tjj8I5qq03rWYvNfiIIUT2ZOavsnpj6fzLB387OE39kNeg9hMX0gNVNufQq04k3OETcNsH5nobdG4eVSCsgeWnTESvo3sxUdRULn4-PZ_JehtddTl2Gx5TTnobQQlqOzpAY5AkJ01Y-HT4d71HrOM7r_hyMBMnPGEJxKSqSGmCRtxhzzIwIeXoo2lPVU3epyQdeCcajqiWCGeVi8my1VFx-EHFZRtnOIzq0I_F1iKWWbSxXRCaSOCLqR16eDSfbwTQTKW5KCGuSpiocfTvJb5vT7DysqRdJ9htGfyBphY65Ye4TtKL8Bq5TLK_Wr6a_0hk4D1oxlkOFjODiH-6UULE1w3SQlQcyJKrVxDwosJeGJ1PSGqxMT535G_qGRhh7s2WY4_fNAYLuRQDbsg6YKPN_qmXGxdtmWruE_we3uaLI7_q0SjrKSAZYpLlMrm225sAZsXyk07K97Efj5goCbXL8B_ask8NZHu9_uSSW1A9WX6mGPVe_VaBXc2l7SWczdcdK2lpSsMyGOD6lKhUD8JvAahz8p5BSBX7TO4LbrgTR736aEVY0w9Hvp6Aag63hoUE96HQqIFTifkzCkfR55Ax4hoZL5DfytIMn8m74abKfmqZSiFaZ7hhErejdixnKbxUMLB9eT5UrseXVVDb51H76zqWN9mRprFRHaymmEcoyalgewvFcY7lkeHu8YMmM_Xy7DG84SfuQUriKJiYG-u6VN_wLZC7N2V49jm0arFJRf3faYN9awWNhQJgccRiAhr3qSA5eqzpFBQV5qc6OgXNcA7P3cwPK5lqy4pF_pEy7rlccWQ1c0NJYzLpK5rZ_QXIlLr0zQlA2jXAbzC8_MorHHUJyPAcxuhN1raLLlDEKa_hCypK3P4JqL2O7hOtu4YjEb7y2w_3zzoZ5wAwVn7PBv_S0esOBFYHg97YgFVSpbEmVYRbv_15Pu7YOd4GYR7wlGjjPB4uBiuBqL0O9LDtcAM1MysfH_SHQkKBzXlWyl8-OBIC_ZMnaZ7A6LZKaZ-zJUTPrYjlQrcTAMf2V2owS4oudRQ8191DMCnE9dWYtBq857oRzFP-7mDqnFOD3T_Tp1GDHdxsWk3TMmm-bJoJPq95nV-ibOdLjQSSABE8w7DvNetbssgMkpyZsDJL-3R3smN4_UwzBNeMMGYn82FGwPL3VhkLSaiprjjo4AP8EnqZmKQdp1LFdYmyopWEh7AKW9KDZdQMC7Srxi_OjfrPkIY9ivxAzy9AhHF-PAk4kVEhguyX7-d4X_fpXXtx-Iz-NyxPC1yP72fr0GAg1_t0YumvfTZL27Bel5AHr2XWigowWgPmhwf_peFkE0isEATZZPrZlIDmqV7ARw9MYCan6vOb29bI_9a7xBnsaXixpTMcq2rbx_klq8FbX5jMNvyKlP_bhhyIWIdcv-aNmo5g3DLdvNmZd0pgCgk5qQyB3uC45DwBkdpvErQMH9r81ObIP9X6z7HKynKKOGWfaaiaspEjAskDBbbJ9Ggx5H8XZ-_meczqt9NtD5lDF_-08xf-xPHAIctDbauBHyiXNtr_sMnQ7zq0RtwD4--i_kdKIMYyy8LIYA7Qc0MZvC5H5aEiNvWDmb4dyPj3OzqlDB7glCcuC79gSYmJNHiuvMGnK5scixznX-VpKUum2F1yuznvzAyYUt4L9DTdR5Oy9rSh4Rm4t_TaFOnKfiC4UgcfospopkAn39J6bk0VYNfGo--lZJwMwqq0oE3tnEA8nSrZPbARspAMRGmuSWNq3lKoqqPX6brIF5QtyOGtsuwuyWB-Yyt0ksAR1wICpnZmXCXXO4gKXvcIAmeDTuC0VBF7nMxig9BlEtlsdakGvy8-JemqKMQVJUUvjjXMwy8h9nY1yYjSZN-IvZpwqREmMoE-9AvXHQC0P4AGeT-janSdDxF0QeSOb1L3mf1BX8w9KcAI4qKqChergZEzHyATsTpt3ig04LrxidvlwTdv2utvx5yZbdHvyIFbWDyLwpCEhgDQi17dT20jFU7jmOp6Y0ZvJeYZ5MYI8WFTiM8X3BOugUE4MnuoR3HyOW5i6WQ7pmRIqQRe1yqxZqk1LMmqI4rLZ5TpDQbLZtyJnRArxfnwOq4LCAFX6Yy97174vwRis6Ip2G9_oJS9OaTBT1e72UlXEvA2gOgvX2iBMMY5uiaq60ZJnvyzdR4kUFBkjDdHjoxPZLOyLP6rrt6VNKmxalCSYh5L3B4bH56cTzpY9jXs8UhG17XJupfIHrIGCc5wbq0sHjcvNouRamuB0Wcx9jBOmaWG5bFJbvDcQ5-bvveqrHL-RTY31ebreU8LwNYdy6r1j0NufulpJ4xAxZ0FGwXu08r4dvHglFIf3DpCGsagmx1z1sQen8qsH0weNUPKoAbN6SybtXbCahRVoWJ0P5BQUhQSMhHmy67N9z1fApRfHWJGntdMfON_EcJzAPrV8XavjVF0fFRDZPGb22q_dHhd0XvW2Ko7ySEAtUeDzOcKhBy1pFdXfXyz-Vi2YLwWKRvaM7T7lZCBI3Bh7wBapLLQGzTdFYJqs9BVTkN52JHkAKTvvhhOxMS2dLO49EvXgrsn-T4cjw-KHbhxA4Nl4PXrhw5vsV2NX-Fn-CFiKm4EPq5DJu3y6BvOqnITf82P63QXEoKNxsbRInTOis1R7GL9rT8WHYoyX4h4GOpr30ngcgVkXuR5DYqCK2ymv17S-3RWhktoL8DizvUuGuIIUJTfXTBLVh-91F9QM5eOz9TzwRISSORxXFT21dRPZSiE5BvJ3y2eQQSr-i7kyLhvxFeq-OsRuCcjtzVXVFPx120WOLHdPKVrFEx29tlaE5uXR0gKEtoXFf5-8yn72e2dlQ8qSgt-pHCMSX74ccKvMb3kSM78EO37DY4bf0hy_ueT6rYlQlyiUKP93B-vhuZdEiN-II5U0tbj9drH_ZzkOl1LG5V8taTNB_fSo93rSK3OaPs1zr2j7A7WbU1J-mwC2UO_cCDyim1dlCT9giMoGzVHTLR1tozK2U7VlAAuuWCHk5p_rqoANaVT43ivYLTy3-uEQcGVjM92YxmxYqGhAM3pOglP0Fy93F3ePGWnXmed1T6zOAVHG56uYdjDv2uJZAAFon9Rf7RJOsC4TG7M5mE9bvGL9bhLVNg10R4MNRV8ZjqCx_hZ3IFljpxQT4R3rYfC8FuDEPpbWPhi4FXCWF-jGj0bJplETWI0_GZQmuYhHbRBfQlsRgyKhIhKXyWgD3-MpNTxKg4YdQnLDMb_Bt2jJFxuhZ1daFEhVwBMCxBHbaMp735nAdb9NtpgV6R40P0F-z0nce8_D1W5YOv7_ktFrZNSBxqd1HTwV6TU6BKpUUZRnihc6QJJuF9igEz7tFccr4NqCvkhGuGJyRGARnexSBDefRLADQJD0cM1_S8UmtX59GDG9JHSPwb9os6Fm5TkpGC1w4X6llPN9LbYSSXD7jNJ0SC5vjwJA2BSvtYx10ys9-56oCG_BXRaDFMnwH0txwvub_kromnbi0r5CqKBynfjp5_Icj6y1IUUCZn86flmfJLiWYQxl8Vp66Cgag0RDFxeLjjK1XkVO1XWyM0VIf-FFg2J_4SIsVxVjLmQFhO7HUc13sukLxtiRh92lO3-XavvhdEMJeIcteEQq_H21ebpAUBSup9brJ-w0th-3i_u-gerP4YiYp-rBwBJDlw1AaFe0Ittnbo458JBPOa8r23O2dMv36Y-37QnbfXjVOQhVfTo4fWhDX1nJ96SoRKKO0gs2rCQpVxTWpsofEitfPWp8gpuPkYg6XF-6CqdxNmEKzQn-IPOnHq0cwdAvvK0HTFGkXJ5R0jopE-pQ65aFZfe3QHuXD8cs4L7M3Ud0Ubv-04BRzHHy9Oa8uJtS-26F-0Xab2_KzWGQAHEsg8gRlRgYP1ygLdZUOHHEd44mkGF1WxAYb5mdOUko5w1hYV1-DbyW6UK5ZiNCuHnVic6bgiEKeg7eYM_J1x5oPpU-7Z-uYyClYnzDr_NXdZ11x3B4AVHrlSWLufBL8RulkcQL5RH5ANIl4NBhyLFAHYavqCDS85pNU4FZ5Hzp4qeWbv-kZbCH7XPBYGdIWyNxq7A2I8W4UO57EVRy0-ial9GYl1vDfmwWFHz2_xjVWrBs_f-DTwQjKxESeqpzdPzSGJyNsA2fnoOBrvftsRis5AkTF53xMpg-fHrHl0Ij6xRvuybSwobOJ9SBX5vC9FwrmAPjJuIOFZuzg5ttk8FZqb5iucGNtrqPrb78ZTsukXhlJhAUH-ERQQPU49cQh1JvY930er1TYCWLpBCLaXDgzcjIW0oxXqUXuLkK17RZVp1V2aXe1kaUhjXEIho81IC5yKYichOZc6UbNu3T-haF_pcBloNqFg3jx-d8hf_FFLtqs2GOLvfILbVei4RI2MzKng-ey4E8vVgukrp8rKzbeT49dHmvUVjt369ig9Plot8fNb__1CmAZ4Glq9TVNronYCd0chnNCAYUPSmO-728jn_Dd14izZ3sg34UUAizJ_GfOQQ-oqJOKo6f-rSJYb3Keh0Gxli2KaUEffOMnGnbRNkE4kuUKX_PHBkYdR_NEqLkTf5pJusaGrBxY0IJprKgJHiW4PL_4Xmk7xsE8nt_4u0d4605wpHI4MNkeWYTPP4Iv-c9D58q4C5tEPe9YZvG8yGVMCLk_DfLmcpf6cL-6bY2NEteDwMsTojT9Yz7f5haxMpQGvR5_DZTK8xVW6TKvfB9Yzaq_SomtKUYdLe5d8KGU3rraCmaLYx8Z_EFkQhFkwKg2KBBzYrDeRNHQ9r61Y0it5LvORjCrru6t8svzq-LY8_IzbbWvVXV94pMXt3zRiqIASc_Pknf8tFFE7y0eimHLKxC-r_540r5Hr4OVtmlOD0z-sWRVgLHuLk05J0SCjbe2lTaENA.8dKRzVH66gaw5ZxMkfQNLw",
        HcxOperations.CLAIM_SUBMIT)
      ).rejects.toThrow("Failed to fetch certificate");
    });

    it("should handle decryption error", async () => {
      const mockPayload = "eyJhbGciOiJSU0EtT0FFUCIsImVuYyI6IkEyNTZHQ00iLCJ4LWhjeC1hcGlfY2FsbF9pZCI6ImQ5MTM1NWJkLTgyODMtNDkzZC1iNGUyLTY1Mjk0ZmFkM2JlZSIsIngtaGN4LXRpbWVzdGFtcCI6IjIwMjMtMDgtMjJUMTA6NTI6MzguOTk3WiIsIngtaGN4LXdvcmtmbG93X2lkIjoiNjAzYzk0ZTEtMjMxMy00OWNlLTg2NzMtNThkZjU3MzFlOWRjIiwieC1oY3gtc2VuZGVyX2NvZGUiOiJ0ZXN0cHJvdmlkZXIxLnN3YXN0aG1vY2tAc3dhc3RoLWhjeC1zdGFnaW5nIiwieC1oY3gtcmVjaXBpZW50X2NvZGUiOiJ0ZXN0cGF5b3IxLnN3YXN0aG1vY2tAc3dhc3RoLWhjeC1zdGFnaW5nIiwieC1oY3gtY29ycmVsYXRpb25faWQiOiJiZmRlYTEyOC1iZmYxLTRjMzMtODY5Ni1hMDkzZDQwZTI2YzgiLCJraWQiOiJIaWJseW10VUl5dmVVOHA1Ujg2WXc1bDFVWHY0NklNRmIwcjI5MjBDVnR3In0.PTdjXK48cQzzUH0YNYzbp3TJ7nwtwwKcKJNIdnKxQLKfillZG85gYvepjHtk4xrwChE4xs0dCD5sCdK4Jx7WsUJKXitWXgaW1rvzgXp_7-bmP6Kv6y2Vcr55oLqdaLklqrH_6Q8rojxCrJacCwF3WjKV2xHd64p4W4p-m_D_0gLp2Ad0biXM11QlLL_AOUZmzV53knyyUaJDR-xy1vo0PBy7i_Woysw7liFL_O1l8kpm6OKW1M7PFayT4z_337lxsbwgteeX7X6zbPjcI3j6jMQWteAXTDb_ZsGQV64L5_Qq1q3GbPzHQPhpl9yMCVEL3hXpAMlH7MhM5Wan7nUuKA.l3V5whM54IQ_j8mU.e-IM_agRyx-lTYBZws8YQB13KpqjEkLjKfeUBmW3s4fmpux_uVNlRI9WS4-YqkHgDavQn39su8t5P-vsASrZ1VzwkLudMcLZATSHZzGs3CDNI_onweoQIEOLh58bsBOeZijg-H771aowZZL_QHLh_jhIA5PaEn5KoaQq94xxP0yHsAnNQBoLpfBHs3I9w2zd_fAShBiKzYZxmPtcWfkt2NsyZmDWgeiSUCpSDppgPNIhKVXyUQlNBxHVqCiUyWI7Dju21DoQBl5Rh9jS0YkkTpw_Rz5REgCtZnxHoheA5Ce8VXkxOkzRO7B6C3PH8svK8zvGEd3B3Kn-mnd8RH8ps1zNCHAqFGTBzqubGHwT0RNkrb8MPvizhFU4ztCWnmwtLgknuF7Xlc4tn020fO2G48Z-Ftt0y0nx2vNVduBTX0UI6f1zEhU8kC4ElDR0jatTf90iFbHfmZ7UQJgRNPqd47Kcs2nS9_Ua3WJK9CAWkfDMlfgaQynqtYubC9DvoLezqrIyNH78xLcWRWAWTpLRqwQ9AEstb7PQHy2FCMlwcr19wa7WEgBZf5OP8bc0co8e2ozEyltTX_fsYh5DMq-GLQ4tnMTQCw8QN2qkHr-gyx6EMxqQrQkR0s6KDF2Mn3OEHr0e873LHnkaJpNeMnW1XV13pvF7HdQynL7BMx1WdFleFj74beD6U4Tg2eBIOkyhdKJPurZr65OSuUWxyEQbkjVOJ_ntqs63hl8AtNWFYRtS_mJj9xb95PzkNvZhHKQCze-0MrAkthCMmkQKUCf87AZCiuXFgKX8c1yfzFJ0b5dPKjoA12yGYLBrlIo2-9lgg8yWTydsZvL19wE0IQ9a1L54ImwTHqnuHV7nWWwTs_sWWcgkQU_SjJe8H00422jU-P3Y8QzxbUy5cGmTMncHHmyWYUGrw-WFca1A7PRpNTBM-4Ra4a0j0pyUn72PIbswWFqKbH5njmxXqJ90EqD7tZ_MaUH9j2xbgLbKPPbPRLf8vZC7gbfS1tJvarL9zT_hK7msmqEiX0TP2GBG542ExYmAmMltRT9jUGABO2DVVEKwFn5Eg68oBLJNnKKumLLIHU5aVFNcUwn7T6VRbGh8OR7pSDcvzI5tfKD9uLyzxnszpJHlXGUEObfruCou_ZLjWO0O8v6BTPavfQtmFVzVhw6RE4GWpNwpGkACKEEHaVRCNDG9xMl91r_Q8AXdNegydzQAsxaRm8y3vP0vtbI_ithWFjwtEgUDgbb2entrOD6dlHrl-KaRgElYr0wYEuQvaFF0MafnTZ0UFRHGrWy_HvUcYYNVLkxnLTUuCfKA2ucbf_dwgEd4CDQM5LIbPruyY-FkwmsTYZecK26Ej9jIB3oQKQr0axvuM38cUwhvYAy7iK0FGeYqNPssReMIyVMEYWIDHJx_Ii8wwkm-vKj8H36N-OuWdKiQBPpkZzfJef4cUe2rEt4rwKOUXMH91SegskQhsfrt0sOVZ-6-ie5dbqbIs-cIFX75xgfzzAOB2NVPl-VyyjUO0ZC_EoHQnaq3T1MEAYIm51VEKmfD-hasAdzk_wuXUEMDbStlJkn_mwCcuG7jvyTHJPjLqJ7JCQdeTAc7tvecAHX3-N87FrZ65fVxNRdcNjXiGbIICR1_xYOoAvcHI9dWJ2YYUDASXFqEX1IMDcRxgXlXxBgFzRlr8EarPQshZEUsq7lVIM1r6rsjLiOzcEX4rKw3_E0dkCFlsZY5Cig7pNHY468c6SqPsfHuFY3pSVx8gd85O9Z0cSk4fYMouTlZsG2KDzdDu632J7E2ur9N-Hs_tG4ENYmZX39WJGzXXWXzeIPvnNPTojtrxj-myw4GpOB0AsZdjPEHDkM4vIjNzLnr7MZz9_x8PuPndaUmxX4Lazgj3axOSmaj6D5U1EYE8YHj6oEgmAMi6TukKwSYGJORkOSoZKazB6Zj73AI-K8lygNg_i-p3iLluZapJJQBl-nevIsepGPu2MSUchpuN0KuEHAW-d1tQRaNQvzMUOYlYKsUocxUtm5u36ygEW4zWBpXTOCKeULDzdoEopNe7HiVOVdcULC3aeIXt2MFLaKZ5-sa7YEpSvoDrcGz4_HidzLX188_5FEYnlVhaYVj2ODSacmv-yGjWWcTybv3q7DURSH0XR8H7hfdPQlShwOhHieboDZIpuWGQgFRnLYkVv39x0NmuoYoNUDCwyWh_IZ9L60tkLcVXoTbzXSynUa2tRmLL2n0lyuwOrQb9_k6qFCQnWjVFr7GN7kwhKmjVuQJ439ev4WYuUHbJIuSHmeyKjHL3di_HIT6EPmMmhDhb3ZKxNFo9yh6PIN8ixZQpzv7jRTKHT0FxbSM1-l4UEvrJBZsnGQ6IbTH2LP9b2caaLlLrzy7cZMrRERQNXW-0y-pWrl60EipzqmnHc334Jzn-DoahAbCWtHEpAeB383BOFxnDevM_p5DWS8qYXdNZi3EV0bxakDjwY5ZmYznA-HkiLmtMB4h_yh0MqsCg25t4YarFC-FLTGSeoHiBgXgQJPZ0ZOUuMsyDVNx_bun93qs2E9GOt9un4UpKOOQ2O7s7t8vDqq6tSyr3m52CyEJZhKCnwrOxPX_bGMU-WKAAetficxNBLhhaeGhiPfdWie1gzETVw0f7cZ1b8fOckw1pIq3xp50q9CfeokB2FRHZH8pYB8FEsEBMo7jPbmcj4AONQwE6mtYjdk4fZ0IXUii0pwpVvGVNjxajM_ipaFFYjvNZchl2yQzra9sApj-jV3wLJ_uds92YPJCNWBpEcVhgmkFlFNOE3HkHgj7mkTTnPoYoPrVXNWeDgXPAAck-JWsUm_BIs5Y0IrPcbKWhxmiOqyqt_ztd51v_LpL4EwKNKFWMmpzJTp2fXH5sAqnfrNhvCGU2y1I5XSdI2FSQHwoQ9JJ_UXJ3QGbAIMI8epBJW8DX8c0WfiVmTCKNLVSR9t93bKz88p3vlBwceT2Ss9NDw58rIU1k4LDQrc1r35hUrJXzdaVOxlPjipO6PlS0TgZr2M6kW2LmMmd0HdcNMs4ey6z1wtvs1UIUwfVzNq8TcruhIiZbt5x_cFUWknh05C7lVsJoN-1SwMgzxjGvF7QXGsAhO_V_PIn7o7S1NQdnRUZQEEhBe1p54Ch-pztE0fnSTTNzJ8KuQXZt2QpoiR44CQpYHkzHZapiWw-vDiFOqoTewaG3O-hiUtQjVEJxdmU6LZgAbtjBCzT3FBrCxudAJXwIetLOK15FZpTO59GKXXLtgAw7jpjcmhOyZlj2TNuIf1jUDnNX7ZLKuh-X0tR1jQCXjv5n2zKpUGknJaVtjfkin6-eH84DTMpPFAn-KUpkYijvnywGsj65dfzCaOSx6zJ-czW_jVXqn42h-vkmC6dXwi_moVw_npyOLlVMJaoHDYtQQahnQdwP47d7CvxQ0NOJbFi3kZ10Onqa8GI4HyKglr7K37W9My8FG6ZoKT3aIOFGcPHxbxE1ETDooHh9yzCqtMhhajWTT15WhLdw6-WBIzH78LL2Ez_DD8OOPwUmbY0WwUqLtKkKYEm1ngZXupuVkjeGNKFrWtpO_nW3HRvt3wg3AhxpEM2WhuJQs-29_4_dowEZlEIIJo-4L0H03E90SvARTZ4tjj8I5qq03rWYvNfiIIUT2ZOavsnpj6fzLB387OE39kNeg9hMX0gNVNufQq04k3OETcNsH5nobdG4eVSCsgeWnTESvo3sxUdRULn4-PZ_JehtddTl2Gx5TTnobQQlqOzpAY5AkJ01Y-HT4d71HrOM7r_hyMBMnPGEJxKSqSGmCRtxhzzIwIeXoo2lPVU3epyQdeCcajqiWCGeVi8my1VFx-EHFZRtnOIzq0I_F1iKWWbSxXRCaSOCLqR16eDSfbwTQTKW5KCGuSpiocfTvJb5vT7DysqRdJ9htGfyBphY65Ye4TtKL8Bq5TLK_Wr6a_0hk4D1oxlkOFjODiH-6UULE1w3SQlQcyJKrVxDwosJeGJ1PSGqxMT535G_qGRhh7s2WY4_fNAYLuRQDbsg6YKPN_qmXGxdtmWruE_we3uaLI7_q0SjrKSAZYpLlMrm225sAZsXyk07K97Efj5goCbXL8B_ask8NZHu9_uSSW1A9WX6mGPVe_VaBXc2l7SWczdcdK2lpSsMyGOD6lKhUD8JvAahz8p5BSBX7TO4LbrgTR736aEVY0w9Hvp6Aag63hoUE96HQqIFTifkzCkfR55Ax4hoZL5DfytIMn8m74abKfmqZSiFaZ7hhErejdixnKbxUMLB9eT5UrseXVVDb51H76zqWN9mRprFRHaymmEcoyalgewvFcY7lkeHu8YMmM_Xy7DG84SfuQUriKJiYG-u6VN_wLZC7N2V49jm0arFJRf3faYN9awWNhQJgccRiAhr3qSA5eqzpFBQV5qc6OgXNcA7P3cwPK5lqy4pF_pEy7rlccWQ1c0NJYzLpK5rZ_QXIlLr0zQlA2jXAbzC8_MorHHUJyPAcxuhN1raLLlDEKa_hCypK3P4JqL2O7hOtu4YjEb7y2w_3zzoZ5wAwVn7PBv_S0esOBFYHg97YgFVSpbEmVYRbv_15Pu7YOd4GYR7wlGjjPB4uBiuBqL0O9LDtcAM1MysfH_SHQkKBzXlWyl8-OBIC_ZMnaZ7A6LZKaZ-zJUTPrYjlQrcTAMf2V2owS4oudRQ8191DMCnE9dWYtBq857oRzFP-7mDqnFOD3T_Tp1GDHdxsWk3TMmm-bJoJPq95nV-ibOdLjQSSABE8w7DvNetbssgMkpyZsDJL-3R3smN4_UwzBNeMMGYn82FGwPL3VhkLSaiprjjo4AP8EnqZmKQdp1LFdYmyopWEh7AKW9KDZdQMC7Srxi_OjfrPkIY9ivxAzy9AhHF-PAk4kVEhguyX7-d4X_fpXXtx-Iz-NyxPC1yP72fr0GAg1_t0YumvfTZL27Bel5AHr2XWigowWgPmhwf_peFkE0isEATZZPrZlIDmqV7ARw9MYCan6vOb29bI_9a7xBnsaXixpTMcq2rbx_klq8FbX5jMNvyKlP_bhhyIWIdcv-aNmo5g3DLdvNmZd0pgCgk5qQyB3uC45DwBkdpvErQMH9r81ObIP9X6z7HKynKKOGWfaaiaspEjAskDBbbJ9Ggx5H8XZ-_meczqt9NtD5lDF_-08xf-xPHAIctDbauBHyiXNtr_sMnQ7zq0RtwD4--i_kdKIMYyy8LIYA7Qc0MZvC5H5aEiNvWDmb4dyPj3OzqlDB7glCcuC79gSYmJNHiuvMGnK5scixznX-VpKUum2F1yuznvzAyYUt4L9DTdR5Oy9rSh4Rm4t_TaFOnKfiC4UgcfospopkAn39J6bk0VYNfGo--lZJwMwqq0oE3tnEA8nSrZPbARspAMRGmuSWNq3lKoqqPX6brIF5QtyOGtsuwuyWB-Yyt0ksAR1wICpnZmXCXXO4gKXvcIAmeDTuC0VBF7nMxig9BlEtlsdakGvy8-JemqKMQVJUUvjjXMwy8h9nY1yYjSZN-IvZpwqREmMoE-9AvXHQC0P4AGeT-janSdDxF0QeSOb1L3mf1BX8w9KcAI4qKqChergZEzHyATsTpt3ig04LrxidvlwTdv2utvx5yZbdHvyIFbWDyLwpCEhgDQi17dT20jFU7jmOp6Y0ZvJeYZ5MYI8WFTiM8X3BOugUE4MnuoR3HyOW5i6WQ7pmRIqQRe1yqxZqk1LMmqI4rLZ5TpDQbLZtyJnRArxfnwOq4LCAFX6Yy97174vwRis6Ip2G9_oJS9OaTBT1e72UlXEvA2gOgvX2iBMMY5uiaq60ZJnvyzdR4kUFBkjDdHjoxPZLOyLP6rrt6VNKmxalCSYh5L3B4bH56cTzpY9jXs8UhG17XJupfIHrIGCc5wbq0sHjcvNouRamuB0Wcx9jBOmaWG5bFJbvDcQ5-bvveqrHL-RTY31ebreU8LwNYdy6r1j0NufulpJ4xAxZ0FGwXu08r4dvHglFIf3DpCGsagmx1z1sQen8qsH0weNUPKoAbN6SybtXbCahRVoWJ0P5BQUhQSMhHmy67N9z1fApRfHWJGntdMfON_EcJzAPrV8XavjVF0fFRDZPGb22q_dHhd0XvW2Ko7ySEAtUeDzOcKhBy1pFdXfXyz-Vi2YLwWKRvaM7T7lZCBI3Bh7wBapLLQGzTdFYJqs9BVTkN52JHkAKTvvhhOxMS2dLO49EvXgrsn-T4cjw-KHbhxA4Nl4PXrhw5vsV2NX-Fn-CFiKm4EPq5DJu3y6BvOqnITf82P63QXEoKNxsbRInTOis1R7GL9rT8WHYoyX4h4GOpr30ngcgVkXuR5DYqCK2ymv17S-3RWhktoL8DizvUuGuIIUJTfXTBLVh-91F9QM5eOz9TzwRISSORxXFT21dRPZSiE5BvJ3y2eQQSr-i7kyLhvxFeq-OsRuCcjtzVXVFPx120WOLHdPKVrFEx29tlaE5uXR0gKEtoXFf5-8yn72e2dlQ8qSgt-pHCMSX74ccKvMb3kSM78EO37DY4bf0hy_ueT6rYlQlyiUKP93B-vhuZdEiN-II5U0tbj9drH_ZzkOl1LG5V8taTNB_fSo93rSK3OaPs1zr2j7A7WbU1J-mwC2UO_cCDyim1dlCT9giMoGzVHTLR1tozK2U7VlAAuuWCHk5p_rqoANaVT43ivYLTy3-uEQcGVjM92YxmxYqGhAM3pOglP0Fy93F3ePGWnXmed1T6zOAVHG56uYdjDv2uJZAAFon9Rf7RJOsC4TG7M5mE9bvGL9bhLVNg10R4MNRV8ZjqCx_hZ3IFljpxQT4R3rYfC8FuDEPpbWPhi4FXCWF-jGj0bJplETWI0_GZQmuYhHbRBfQlsRgyKhIhKXyWgD3-MpNTxKg4YdQnLDMb_Bt2jJFxuhZ1daFEhVwBMCxBHbaMp735nAdb9NtpgV6R40P0F-z0nce8_D1W5YOv7_ktFrZNSBxqd1HTwV6TU6BKpUUZRnihc6QJJuF9igEz7tFccr4NqCvkhGuGJyRGARnexSBDefRLADQJD0cM1_S8UmtX59GDG9JHSPwb9os6Fm5TkpGC1w4X6llPN9LbYSSXD7jNJ0SC5vjwJA2BSvtYx10ys9-56oCG_BXRaDFMnwH0txwvub_kromnbi0r5CqKBynfjp5_Icj6y1IUUCZn86flmfJLiWYQxl8Vp66Cgag0RDFxeLjjK1XkVO1XWyM0VIf-FFg2J_4SIsVxVjLmQFhO7HUc13sukLxtiRh92lO3-XavvhdEMJeIcteEQq_H21ebpAUBSup9brJ-w0th-3i_u-gerP4YiYp-rBwBJDlw1AaFe0Ittnbo458JBPOa8r23O2dMv36Y-37QnbfXjVOQhVfTo4fWhDX1nJ96SoRKKO0gs2rCQpVxTWpsofEitfPWp8gpuPkYg6XF-6CqdxNmEKzQn-IPOnHq0cwdAvvK0HTFGkXJ5R0jopE-pQ65aFZfe3QHuXD8cs4L7M3Ud0Ubv-04BRzHHy9Oa8uJtS-26F-0Xab2_KzWGQAHEsg8gRlRgYP1ygLdZUOHHEd44mkGF1WxAYb5mdOUko5w1hYV1-DbyW6UK5ZiNCuHnVic6bgiEKeg7eYM_J1x5oPpU-7Z-uYyClYnzDr_NXdZ11x3B4AVHrlSWLufBL8RulkcQL5RH5ANIl4NBhyLFAHYavqCDS85pNU4FZ5Hzp4qeWbv-kZbCH7XPBYGdIWyNxq7A2I8W4UO57EVRy0-ial9GYl1vDfmwWFHz2_xjVWrBs_f-DTwQjKxESeqpzdPzSGJyNsA2fnoOBrvftsRis5AkTF53xMpg-fHrHl0Ij6xRvuybSwobOJ9SBX5vC9FwrmAPjJuIOFZuzg5ttk8FZqb5iucGNtrqPrb78ZTsukXhlJhAUH-ERQQPU49cQh1JvY930er1TYCWLpBCLaXDgzcjIW0oxXqUXuLkK17RZVp1V2aXe1kaUhjXEIho81IC5yKYichOZc6UbNu3T-haF_pcBloNqFg3jx-d8hf_FFLtqs2GOLvfILbVei4RI2MzKng-ey4E8vVgukrp8rKzbeT49dHmvUVjt369ig9Plot8fNb__1CmAZ4Glq9TVNronYCd0chnNCAYUPSmO-728jn_Dd14izZ3sg34UUAizJ_GfOQQ-oqJOKo6f-rSJYb3Keh0Gxli2KaUEffOMnGnbRNkE4kuUKX_PHBkYdR_NEqLkTf5pJusaGrBxY0IJprKgJHiW4PL_4Xmk7xsE8nt_4u0d4605wpHI4MNkeWYTPP4Iv-c9D58q4C5tEPe9YZvG8yGVMCLk_DfLmcpf6cL-6bY2NEteDwMsTojT9Yz7f5haxMpQGvR5_DZTK8xVW6TKvfB9Yzaq_SomtKUYdLe5d8KGU3rraCmaLYx8Z_EFkQhFkwKg2KBBzYrDeRNHQ9r61Y0it5LvORjCrru6t8svzq-LY8_IzbbWvVXV94pMXt3zRiqIASc_Pknf8tFFE7y0eimHLKxC-r_540r5Hr4OVtmlOD0z-sWRVgLHuLk05J0SCjbe2lTaENA.8dKRzVH66gaw5ZxMkfQNLw";
      const mockCert = "-----BEGIN PRIVATE KEY----- \n \
      MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCG+XLPYiCxrZq7 \n \
      1IX+w7uoDGxGI7qy7XaDbL3BJE33ju7rjdrP7wsAOWRvM8BIyWuRZZhl9xG+u7l/ \n\
      7OsZAzGoqI7p+32x+r9IJVzboLDajk6tp/NPg1csc7f2M5Bu6rkLEvrKLz3dgy3Q \n \
      928rMsD3rSmzBLelfKTo+aDXvCOiw1dMWsZZdkEpCTJxH39Nb2K4S59kO/R2GtSU \n \
      /QMLq65m34XcMZpDtatA1u1S8JdZNNeMCO+NuFKBzIfvXUCQ8jkf7h612+UP1AYh \n \
      oyCMFpzUZ9b7liQF9TYpX1Myr/tT75WKuRlkFlcALUrtVskL8KA0w6sA0nX5fORV \n \
      suVehVeDAgMBAAECggEAX1n1y5/M7PhxqWO3zYTFGzC7hMlU6XZsFOhLHRjio5Ks \n \
      ImgyPlbm9J+W3iA3JLR2c17MTKxAMvg3UbIzW5YwDLAXViC+aW90like8mEQzzVd \n \
      S7ysXG2ytcqCGUHQNStI0hP0a8T39XbodQl31ZKjU9VW8grRGe12Kse+4ukcW6yR \n \
      VES+CkyO5BQB+vs3voZavodRGsk/YSt00PtIrFPJgkDuyzzcybKJD9zeJk5W3OGV \n \
      K1z0on+NXKekRti5FBx/uEkT3+knkz7ZlTDNcyexyeiv7zSL/L6tcszV0Fe0g9vJ \n \
      ktqnenEyh4BgbqABPzQR++DaCgW5zsFiQuD0hMadoQKBgQC+rekgpBHsPnbjQ2Pt \n \
      og9cFzGY6LRGXxVcY7hKBtAZOKAKus5RmMi7Uv7aYJgtX2jt6QJMuE90JLEgdO2v \n \
      xYG5V7H6Tx+HqH7ftCGZq70A9jFBaba04QAp0r4TnD6v/LM+PGVT8FKtggp+o7gZ \n \
      qXYlSVFm6YzI37G08w43t2j2aQKBgQC1Nluxop8w6pmHxabaFXYomNckziBNMML5 \n \
      GjXW6b0xrzlnZo0p0lTuDtUy2xjaRWRYxb/1lu//LIrWqSGtzu+1mdmV2RbOd26P \n \
      ArKw0pYpXhKFu/W7r6n64/iCisoMJGWSRJVK9X3D4AjPaWOtE+jUTBLOk0lqPJP8 \n \
      K6yiCA6ZCwKBgDLtgDaXm7HdfSN1/Fqbzj5qc3TDsmKZQrtKZw5eg3Y5CYXUHwbs \n \
      J7DgmfD5m6uCsCPa+CJFl/MNWcGxeUpZFizKn16bg3BYMIrPMao5lGGNX9p4wbPN \n \
      5J1HDD1wnc2jULxupSGmLm7pLKRmVeWEvWl4C6XQ+ykrlesef82hzwcBAoGBAKGY \n \
      3v4y4jlSDCXaqadzWhJr8ffdZUrQwB46NGb5vADxnIRMHHh+G8TLL26RmcET/p93 \n \
      gW518oGg7BLvcpw3nOZaU4HgvQjT0qDvrAApW0V6oZPnAQUlarTU1Uk8kV9wma9t \n \
      P6E/+K5TPCgSeJPg3FFtoZvcFq0JZoKLRACepL3vAoGAMAUHmNHvDI+v0eyQjQxl \n \
      meAscuW0KVAQQR3OdwEwTwdFhp9Il7/mslN1DLBddhj6WtVKLXu85RIGY8I2NhMX \n \
      LFMgl+q+mvKMFmcTLSJb5bJHyMz/foenGA/3Yl50h9dJRFItApGuEJo/30cG+VmY \n \
      o2rjtEifktX4mDfbgLsNwsI= \n \
      -----END PRIVATE KEY-----";

      axios.get.mockResolvedValueOnce({ data: mockCert });
      JWEHelper.decrypt.mockRejectedValueOnce(new Error("Decryption error"));

      await expect(
        instance.process(mockPayload, "mockOperation")
      ).rejects.toThrow("Decryption error");
    });
  });
});
