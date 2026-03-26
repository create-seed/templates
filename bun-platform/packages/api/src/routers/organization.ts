import { ORPCError } from '@orpc/server'
import { and, asc, eq } from 'drizzle-orm'
import z from 'zod'
import { auth } from '@bun-platform/auth'
import { db } from '@bun-platform/db'
import { member, organization } from '@bun-platform/db/schema/auth'

import { protectedProcedure } from '../index'

type OrganizationMembershipRecord = {
  id: string
  logo: string | null
  name: string
  role: string
  slug: string
}

type OrganizationMembershipSummary = {
  id: string
  isActive: boolean
  logo: string | null
  name: string
  role: string
  slug: string
}

function appendHeaders(target: Headers, source?: Headers | null) {
  if (!source) {
    return
  }

  source.forEach((value, key) => {
    if (key.toLowerCase() === 'set-cookie') {
      target.append(key, value)
      return
    }

    target.set(key, value)
  })
}

async function getOrganizationMembershipRecord(
  organizationId: string,
  userId: string,
): Promise<OrganizationMembershipRecord | null> {
  const [record] = await db
    .select({
      id: organization.id,
      logo: organization.logo,
      name: organization.name,
      role: member.role,
      slug: organization.slug,
    })
    .from(member)
    .innerJoin(organization, eq(member.organizationId, organization.id))
    .where(and(eq(member.organizationId, organizationId), eq(member.userId, userId)))
    .limit(1)

  return record ?? null
}

async function listOrganizationMembershipRecords(userId: string): Promise<OrganizationMembershipRecord[]> {
  return await db
    .select({
      id: organization.id,
      logo: organization.logo,
      name: organization.name,
      role: member.role,
      slug: organization.slug,
    })
    .from(member)
    .innerJoin(organization, eq(member.organizationId, organization.id))
    .where(eq(member.userId, userId))
    .orderBy(asc(organization.name), asc(organization.slug))
}

function toOrganizationMembershipSummary(
  activeOrganizationId: string | null,
  record: OrganizationMembershipRecord,
): OrganizationMembershipSummary {
  return {
    id: record.id,
    isActive: activeOrganizationId === record.id,
    logo: record.logo,
    name: record.name,
    role: record.role,
    slug: record.slug,
  }
}

export const organizationRouter = {
  listMine: protectedProcedure.handler(async ({ context }) => {
    const activeOrganizationId = context.session.session.activeOrganizationId ?? null
    const organizations = await listOrganizationMembershipRecords(context.session.user.id)

    return {
      activeOrganizationId,
      organizations: organizations.map((record) => toOrganizationMembershipSummary(activeOrganizationId, record)),
    }
  }),

  setActive: protectedProcedure
    .input(
      z.object({
        organizationId: z.string().min(1),
      }),
    )
    .handler(async ({ context, input }) => {
      const organizationMembership = await getOrganizationMembershipRecord(
        input.organizationId,
        context.session.user.id,
      )

      if (!organizationMembership) {
        throw new ORPCError('NOT_FOUND', {
          message: 'Organization not found.',
        })
      }

      const { headers } = await auth.api.setActiveOrganization({
        body: {
          organizationId: input.organizationId,
        },
        headers: context.requestHeaders,
        returnHeaders: true,
      })

      appendHeaders(context.responseHeaders, headers)

      return {
        activeOrganizationId: input.organizationId,
        organization: toOrganizationMembershipSummary(input.organizationId, organizationMembership),
      }
    }),
}
